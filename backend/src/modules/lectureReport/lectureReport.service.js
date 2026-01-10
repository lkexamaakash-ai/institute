const { prisma } = require("../../config/db");

const getPenaltyReport = async ({
  branchId,
  facultyId,
  month,
  year,
  currentUser,
}) => {
  // if (
  //   currentUser.role === "BRANCH_ADMIN" &&
  //   currentUser.branchId !== branchId
  // ) {
  //   throw new Error("Access denied");
  // }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const whereClause = {
    branchId,
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (facultyId) {
    whereClause.facultyId = facultyId;
  }

  const lectures = await prisma.lectureSchedule.findMany({
    where: whereClause,
    include: {
      faculty: {
        select: {
          id: true,
          name: true,
        },
      },
      attendance: true,
    },
  });

  const report = {};

  for (const lec of lectures) {
    const fid = lec.faculty.id;

    if (!report[fid]) {
      report[fid] = {
        facultyId: fid,
        facultyName: lec.faculty.name,
        plannedLectures: 0,
        conductedLectures: 0,
        noPenalty: 0,
        lateStart: 0,
        earlyEnd: 0,
        both: 0,
      };
    }
  
   report[fid].plannedLectures++;

    if (lec.attendance) {
      report[fid].conductedLectures++;

      switch (lec.attendance.penalty) {
        case "NONE":
          report[fid].noPenalty++;
          break;
        case "LATE_START":
          report[fid].lateStart++;
          break;
        case "EARLY_END":
          report[fid].earlyEnd++;
          break;
        case "BOTH":
          report[fid].both++;
          break;
      }
    }
}

  return Object.values(report);
};

module.exports = { getPenaltyReport };