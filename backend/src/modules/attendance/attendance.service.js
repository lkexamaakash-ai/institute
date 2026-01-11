const { prisma } = require("../../config/db");

const ALLOWED_MINUTES = 15;
function calculatePenalty(plannedStart, plannedEnd, actualStart, actualEnd) {
  const plannedStartTime = new Date(plannedStart);
  const plannedEndTime = new Date(plannedEnd);
  const actualStartTime = new Date(actualStart);
  const actualEndTime = new Date(actualEnd);

  const lateMinutes = Math.max(
    0,
    (actualStartTime - plannedStartTime) / (1000 * 60)
  );

  const earlyMinutes = Math.max(
    0,
    (plannedEndTime - actualEndTime) / (1000 * 60)
  );

  const is_late = lateMinutes > ALLOWED_MINUTES;
  const isEarly = earlyMinutes > ALLOWED_MINUTES;

  if (is_late && isEarly) return "BOTH";
  if (is_late) return "LATE_START";
  if (isEarly) return "EARLY_END";
  return "NONE";
}

const markLectureAttendance = async ({
  lectureId,
  actualStartTime,
  actualEndTime,
  status,
}) => {
  const lecture = await prisma.lectureSchedule.findUnique({
    where: { id: lectureId },
    include: {
      faculty: true,
    },
  });

  if (!lecture) throw new Error("Lecture not found");

  let penalty = "NONE";
  let payout = 0;

  if (status === "CANCELLED") {
    if (lecture.faculty.facultyType === "LECTURE_BASED") {
      payout = Math.floor((lecture.faculty.lectureRate || 0) / 2);
    }

    penalty = "NONE";
  } else if (status === "MISSED") {
    payout = 0;
    penalty = "NONE";
  } else {
    penalty = calculatePenalty(
      lecture.startTime,
      lecture.endTime,
      actualStartTime,
      actualEndTime
    );

    if (lecture.faculty.facultyType === "LECTURE_BASED") {
      const durationMinutes =
        (new Date(actualEndTime) - new Date(actualStartTime)) / (1000 * 60);

      const lectureHour = durationMinutes / 60;
      const baseHours = 2;

      payout = Math.floor(
        (lectureHour / baseHours) * (lecture.faculty.lectureRate || 0)
      );
    }
  }

  return await prisma.lectureAttendance.create({
    data: {
      lectureId,
      actualStartTime,
      actualEndTime,
      penalty,
      payout,
      status,
    },
  });
};

const getFacultyMonthlySummary = async (facultyId, month, year) => {
  const faculty = await prisma.user.findUnique({
    where: {
      id: facultyId,
    },
  });

  if (!faculty || faculty.role !== "FACULTY") {
    throw new Error("Faculty not found");
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const lectures = await prisma.lectureAttendance.findMany({
    where: {
      lecture: {
        facultyId,
      },
      data: {
        gte: start,
        lte: end,
      },
    },
  });

  let conducted = 0;
  let cancelled = 0;
  let missed = 0;

  let lateCount = 0;
  let earlyCount = 0;
  let bothCount = 0;

  let totalPayout = 0;

  lectures.forEach((l) => {
    if (l.status === "CONDUCTED") conducted++;
    if (l.status === "CANCELLED") cancelled++;
    if (l.status === "MISSED") missed++;

    if (l.penalty === "LATE_START") lateCount++;
    if (l.penalty === "EARLY_END") earlyCount++;
    if (l.penalty === "BOTH") bothCount++;

    totalPayout += l.payout || 0;
  });

  const PlannedLectures = await prisma.lectureSchedule.count({
    where: {
      facultyId,
      StartDate: {
        lte: end,
      },
      EndDate: {
        gte: start,
      },
    },
  });

  const remainingLectures = PlannedLectures - (conducted + cancelled + missed);

  return {
    facultyId,
    month,
    year,
    facultyType: faculty.facultyType,

    PlannedLectures,
    conducted,
    cancelled,
    missed,
    remainingLectures,

    penalties: {
      late: lateCount,
      early: earlyCount,
      both: bothCount,
    },

    totalPayout: Math.floor(totalPayout),
  };
};

// Salary Based Faculty Attendance and Salary Summary
const markSalaryBasedFacultyAttendance = async ({
  facultyId,
  date,
  inTime,
  outTime,
  isLeave,
}) => {
  const faculty = await prisma.user.findUnique({
    where: {
      id: facultyId,
    },
  });

  if (
    !faculty ||
    faculty.role !== "FACULTY" ||
    faculty.facultyType !== "SALARY_BASED"
  ) {
    throw new Error("Salary based faculty not found");
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  let workingMintues = 0;

  if (!isLeave) {
    if (!inTime || !outTime) {
      throw new Error("In-time and Out-time are required if not on leave");
    }

    workingMintues = (new Date(outTime) - new Date(inTime)) / (1000 * 60);

    if (workingMintues < 0) {
      throw new Error("Out-time must be after In-time");
    }
  }

  return await prisma.facultyAttendance.upsert({
    where: {
      facultyId_date: {
        facultyId,
        date: attendanceDate,
      },
    },
    update: {
      inTime,
      outTime,
      isLeave,
      workingMintues,
    },
    create: {
      facultyId,
      date: attendanceDate,
      inTime: isLeave ? null : inTime,
      outTime: isLeave ? null : outTime,
      isLeave,
      workingMintues,
    },
  });
};

const getSalaryBasedFacultyMonthlySummary = async (facultyId, month, year) => {
  const faculty = await prisma.user.findUnique({
    where: {
      id: facultyId,
    },
  });

  if (!faculty || faculty.role !== "FACULTY") {
    throw new Error("Invalid faculty");
  }

  if (faculty.facultyType !== "SALARY_BASED") {
    throw new Error("Faculty is not salary-based");
  }

  if (!faculty.salary) {
    throw new Error("faculty monthly salary not configured");
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const attendance = await prisma.facultyAttendance.findMany({
    where: {
      facultyId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const totalDaysInMonth = end.getDate();
  const leaveDays = attendance.filter((a) => a.isLeave).length;

  const workingDays = totalDaysInMonth - leaveDays;
  const totalWorkingMinutes = attendance
    .filter((a) => !a.isLeave)
    .reduce((sum, a) => sum + a.workingMinutes, 0);

  const perDaySalary = faculty.salary / totalDaysInMonth;
  const leaveDeduction = leaveDays * perDaySalary;

  const netSalary = faculty.salary - leaveDeduction

  return {
    facultyId,
    facultyType:"SALARY_BASED",
    month,
    year,
    monthlySalary: faculty.salary,
    perDaySalary:Math.round(perDaySalary),

    totalDays: totalDaysInMonth,
    workingDays,
    leaveDays,

    leaveDeduction: Math.round(leaveDeduction),
    netSalary: Math.max(0, Math.round(netSalary)),


    attendanceSummary:{
      totalWorkingMinutes,
      averageDailyMinutes:
        workingDays > 0 ? Math.round(totalWorkingMinutes/workingDays): 0,
    }
  }
};

module.exports = {
  markLectureAttendance,
  getFacultyMonthlySummary,
  markSalaryBasedFacultyAttendance,
  getSalaryBasedFacultyMonthlySummary
};
