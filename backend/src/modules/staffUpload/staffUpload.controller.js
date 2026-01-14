const XLSX = require("xlsx");
const { prisma } = require("../../config/db");

function buildBranchMap(branchRow, staffRow) {
  const map = {};
  let currentBranch = null;

  Object.keys(staffRow).forEach((key) => {
    if (branchRow[key] && typeof branchRow[key] === "string") {
      currentBranch = branchRow[key].trim();
    }

    if (currentBranch) {
      map[key] = currentBranch;
    }
  });

  return map;
}

function excelDateToJSDate(value) {
  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    date.setUTCHours(0, 0, 0, 0); // 🔥 FIX
    return date;
  }

  if (typeof value === "string") {
    if (/^\d{2}\/\d{2}$/.test(value)) {
      const [dd, mm] = value.split("/");
      const date = new Date(`2025-${mm}-${dd}`);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    const parsed = new Date(value);
    if (!isNaN(parsed)) {
      parsed.setUTCHours(0, 0, 0, 0);
      return parsed;
    }
  }

  return null;
}

function parseShift(shift) {
  if (!shift || !shift.includes("TO")) return { start: null, end: null };

  const [start, end] = shift.split("TO").map((s) => s.trim());
  return { start, end };
}

function parseAttendance(cell) {
  if (!cell) return null;

  const text = cell.toString().trim().toUpperCase();

  // WEEK OFF
  if (text.includes("WEEK OFF")) {
    return { status: "WEEK_OFF" };
  }

  // Extract signed number (+2.5, -1.5, 1.5)
  const numberMatch = text.match(/[+-]?\d+(\.\d+)?/);
  const value = numberMatch ? Number(numberMatch[0]) : 0;
  console.log(value);

  // ABSENT
  if (text.startsWith("A")) {
    return {
      status: "ABSENT",
      unpaid: text.includes("UNPAID"),
      deficitHours: value > 0 ? value : 0, // A (1.5)
    };
  }

  // PRESENT
  if (text.startsWith("P")) {
    return {
      status: "PRESENT",
      extraHours: value > 0 ? value : 0, // P +2.5
      deficitHours: value < 0 ? Math.abs(value) : 0, // P -1.5
      unpaid: text.includes("UNPAID"),
    };
  }

  return null;
}

const saveAttendanceToDB = async (finalAttendance) => {
  for (const att of finalAttendance) {
    await prisma.historicalStaffData.create({
      data: {
        date: att.date,
        shiftStart: att.shiftStart,
        shiftEnd: att.shiftEnd,
        staffName: att.staffName,
        status: att.status,
        unpaid: att.unpaid,
        deficitHours: att.deficitHours,
        extraHours: att.extraHours,
        branchName: att.branchName,
      },
    });
  }
};

const staffUploadData = async (req, res) => {
  try {
    const { sheetNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file required",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[sheetNumber];
    const workSheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(workSheet);

    const branchRow = data[0];
    const staffRow = data[1];
    const shiftRow = data[2];

    const branchMap = buildBranchMap(branchRow, staffRow);

    const staffKeys = Object.keys(staffRow).filter((k) => k !== "__EMPTY");

    const staffList = staffKeys.map((key) => ({
      key,
      name: staffRow[key],
      branch: branchMap[key], // ✅ always filled now
      shift: shiftRow[key],
    }));

    const attendanceRows = data.filter(
      (row) =>
        typeof row.__EMPTY === "number" || /^\d{2}\/\d{2}$/.test(row.__EMPTY) // 13/04
    );

    const records = [];

    attendanceRows.forEach((row) => {
      let date;

      date = excelDateToJSDate(row.__EMPTY);

      staffList.forEach((staff) => {
        const cell = row[staff.key];
        const att = parseAttendance(cell);
        if (!att) return;

        const shift = parseShift(staff.shift);
        records.push({
          branchName: staff.branch,
          staffName: staff.name,
          date,
          status: att.status,
          extraHours: att.extraHours || 0,
          deficitHours: att.deficitHours || 0,
          unpaid: att.unpaid || false,
          shiftStart: shift.start,
          shiftEnd: shift.end,
        });
      });
    });

    await saveAttendanceToDB(records);

    res.json({
      success: true,
      rows: data.length,
      message:"Successful imported all data"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to read excel file",
      error: err.message,
    });
  }
};

module.exports = { staffUploadData };
