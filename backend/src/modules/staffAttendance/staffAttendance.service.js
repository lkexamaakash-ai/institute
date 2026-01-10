const { prisma } = require("../../config/db");

function calculateStaffAttendance({
  shiftStartTime,
  shiftEndTime,
  actualInTime,
  actualOutTime,
}) {
  const lateMinutes = (actualInTime - shiftStartTime) / (1000 * 60);

  const isLate = lateMinutes > 30;

  let overtimeMinutes = 0;
  let overtimePay = 0;

  if (actualOutTime > shiftEndTime) {
    overtimeMinutes = (actualOutTime - shiftEndTime) / (1000 * 60);

    const slots = Math.floor(overtimeMinutes / 30);

    overtimePay = slots * 50;
  }

  return {
    isLate,
    overtimeMinutes: Math.floor(overtimeMinutes),
    overtimePay,
  };
}

const markStaffAttendance = async ({
  staffId,
  branchId,
  shiftStartTime,
  shiftEndTime,
  actualInTime,
  actualOutTime,
}) => {
  const calc = calculateStaffAttendance({
    shiftStartTime,
    shiftEndTime,
    actualInTime,
    actualOutTime,
  });

  return await prisma.staffAttendance.create({
    data: {
      staffId,
      branchId,
      date: new Date(shiftStartTime.setHours(0, 0, 0, 0)),
      shiftStartTime,
      shiftEndTime,
      actualInTime,
      actualOutTime,
      isLate: calc.isLate,
      overtimeMinutes: calc.overtimeMinutes,
      overtimePay: calc.overtimePay,
    },
  });
};


const getStaffMonthlyReport = async (staffId, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  return await prisma.staffAttendance.findMany({
    where: {
      staffId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });
};


module.exports = {
  markStaffAttendance,
  getStaffMonthlyReport,
};
