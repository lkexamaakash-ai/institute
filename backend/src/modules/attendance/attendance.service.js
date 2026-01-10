const { prisma } = require("../../config/db");

const ALLOWED_MINUTES = 15;
function calculatePenalty(plannedStart, plannedEnd, actualStart, actualEnd) {
  const plannedStartTime = new Date(plannedStart);
  const plannedEndTime = new Date(plannedEnd);
  const actualStartTime = new Date(actualStart);
  const actualEndTime = new Date(actualEnd);


  const lateMinutes = (actualStartTime - plannedStartTime) / (1000 * 60);

  const earlyMinutes = (plannedEndTime - actualEndTime) / (1000 * 60);

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
  payout,
  status
}) => {
  const lecture = await prisma.lectureSchedule.findUnique({
    where: { id: lectureId },
  });

  if (!lecture) throw new Error("Lecture not found");

  const penalty = calculatePenalty(
    lecture.startTime,
    lecture.endTime,
    actualStartTime,
    actualEndTime
  );

  console.log(penalty)

  return await prisma.lectureAttendance.create({
    data: {
      lectureId,
      actualStartTime,
      actualEndTime,
      penalty,
      payout,
      status
    },
  });
};

module.exports = {
  markLectureAttendance,
};
