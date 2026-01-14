const XLSX = require("xlsx");
const { prisma } = require("../../config/db");

/* ------------------ Utils ------------------ */

const excelSerialToDate = (value) => {

  // Excel serial number
  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  // dd-mm-yyyy OR yyyy-mm-dd OR ISO
  if (typeof value === "string") {
    // dd-mm-yyyy
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split("-");
      return new Date(yyyy, mm - 1, dd);
    }

    // yyyy-mm-dd or ISO
    const parsed = new Date(value);
    if (!isNaN(parsed)) {
      parsed.setUTCHours(0, 0, 0, 0);
      return parsed;
    }
  }

  return null;
};

const normalizePhone = (phone) => {
  if (!phone) return null;

  // string banao + sirf digits rakho
  let clean = String(phone).replace(/\D/g, "");

  // agar 12 digits hai aur 91 se start hota hai → last 10 lo
  if (clean.length > 10) {
    clean = clean.slice(-10);
  }

  return clean;
};

/* ------------------ 1️⃣ Detect batch columns dynamically ------------------ */

const detectBatchColumns = (row) => {
  const batches = [];

  Object.entries(row).forEach(([key, value]) => {
    if (
      key.startsWith("__EMPTY") &&
      typeof value === "string" &&
      value.toUpperCase().includes("BATCH") &&
      value.toUpperCase() !== "BATCH"
    ) {
      const index =
        key === "__EMPTY" ? 0 : parseInt(key.replace("__EMPTY_", ""));
      batches.push({
        batch: value.trim(),
        baseIndex: index,
      });
    }
  });

  return batches;
};

const buildBatchColumnMap = (batchMeta) => {
  return batchMeta.map((b) => ({
    batch: b.batch.replace(" BATCH", ""),
    faculty: `__EMPTY_${b.baseIndex}`,
    subject: `__EMPTY_${b.baseIndex + 1}`,
    inTime: `__EMPTY_${b.baseIndex + 2}`,
    outTime: `__EMPTY_${b.baseIndex + 3}`,
    total: `__EMPTY_${b.baseIndex + 4}`,
    penalty: `__EMPTY_${b.baseIndex + 5}`,
  }));
};

/* ------------------ 2️⃣ Faculty phone map from Excel ------------------ */

// const buildFacultyPhoneMap = (rows) => {
//   const map = new Map();

//   rows.forEach((row) => {
//     Object.values(row).forEach((value, index) => {
//       if (typeof value === "string") {
//         const name = value.trim();

//         // faculty name heuristic
//         if (!name || name.length < 3) return;

//         // search phone in same row
//         const phone = Object.values(row).find((v) => {
//           const phoneStr = String(v).replace(/\D/g, ""); // digits only
//           return phoneStr.length === 10; // ✅ strict 10 digit check
//         });

//         if (phone) {
//           const cleanPhone = String(phone).replace(/\D/g, "");
//           map.set(name, cleanPhone);
//         }
//       }
//     });
//   });

//   return map;
// };

const buildFacultyPhoneMap = (rows) => {
  const map = new Map();
  rows.forEach((row) => {
    const name = row.__EMPTY_3;
    const phone = row.__EMPTY_4;
    if (
      typeof name === "string" &&
      (typeof phone === "number" || typeof phone === "string")
    ) {
      const cleanPhone = normalizePhone(phone);
      if (cleanPhone) {
        map.set(name.trim(), cleanPhone);
      }
    }
  });
  return map;
};

/* ------------------ 3️⃣ Expand attendance rows ------------------ */

const expandAttendanceRow = (row, currentDate, batchColumnMap) => {
  const session = row.__EMPTY_2;
  if (!["MORNING", "AFTERNOON", "EVENING"].includes(session)) return [];

  const records = [];

  batchColumnMap.forEach((cfg) => {
    const facultyName = row[cfg.faculty];

    if (!facultyName || facultyName === "-" || facultyName === "") return;

    records.push({
      date: currentDate,
      session,
      batch: cfg.batch,
      facultyName: facultyName.trim(),
      subject: row[cfg.subject],
      inTime: row[cfg.inTime],
      outTime: row[cfg.outTime],
      total: row[cfg.total],
      penalty: row[cfg.penalty],
    });
  });

  return records;
};

/* ------------------ 4️⃣ Build final attendance ------------------ */

const buildFinalAttendance = (rows) => {
  let currentDate = null;
  let batchColumnMap = [];
  const result = [];

  for (const row of rows) {
    // 🟢 detect batch header row
    const detectedBatches = detectBatchColumns(row);
    if (detectedBatches.length) {
      batchColumnMap = buildBatchColumnMap(detectedBatches);
      continue;
    }

    // 🟢 detect date row
    if (row.__EMPTY !== undefined && row.__EMPTY !== null) {
      const parsedDate = excelSerialToDate(row.__EMPTY);
      if (parsedDate) currentDate = parsedDate;
    }

    // 🟢 attendance rows
    const expanded = expandAttendanceRow(row, currentDate, batchColumnMap);
    result.push(...expanded);
  }

  return result;
};

/* ------------------ 5️⃣ Attach phone number ------------------ */

const attachFacultyPhoneFromExcel = (attendance, facultyPhoneMap) => {
  return attendance.map((att) => ({
    ...att,
    facultyPhone: facultyPhoneMap.get(att.facultyName) || null,
  }));
};

// 0.3368 → 08:05 AM type
const excelTimeToDateTime = (date, excelTime) => {
  if (!date || typeof excelTime !== "number") return null;

  const minutes = Math.round(excelTime * 24 * 60);

  const dt = new Date(date);
  dt.setHours(0, 0, 0, 0);
  dt.setMinutes(minutes);

  return dt;
};

const excelTotalToMinutes = (excelTotal) => {
  if (typeof excelTotal !== "number") return 0;
  return Math.round(excelTotal * 24 * 60);
};

const getBatchIdByName = async (batchName, branchId) => {
  const batch = await prisma.batch.findFirst({
    where: {
      name: batchName,
    },
  });

  if (!batch) throw new Error(`Batch not found: ${batchName}`);
  return batch.id;
};

const getUserIdByPhone = async (phone) => {
  if (!phone) return null;

  const user = await prisma.user.findUnique({
    where: { phoneNumber: phone },
    select: { id: true, name: true },
  });

  return user?.id || null;
};

const saveAttendanceToDB = async (finalAttendance, branchId) => {
  for (const att of finalAttendance) {
    const batchId = await getBatchIdByName(att.batch, branchId);
    const userId = await getUserIdByPhone(att.facultyPhone);

    const inTime = excelTimeToDateTime(att.date, att.inTime);
    const outTime = excelTimeToDateTime(att.date, att.outTime);
    const totalMinutes = excelTotalToMinutes(att.total);

    await prisma.historicalFacultyData.create({
      data: {
        userId: Number(userId),
        // facultyPhone: att.facultyPhone,

        branchId,
        batchId,

        date: att.date,
        Intime: inTime,
        Outtime: outTime,

        subject: att.subject,
        session: att.session,

        totalMinutes,
        totalPenalty: att.penalty || 0,
        facultyName: att.facultyName,
      },
    });
  }
};

/* ------------------ Controller ------------------ */

const uploadfile = async (req, res) => {
  try {
    const { branchId, sheetNumber } = req.body;
    // const sheetNumber = parseInt(req.body.sheetNumber);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file required",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[sheetNumber]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // faculty phone map from Excel itself
    const facultyPhoneMap = buildFacultyPhoneMap(rows);

    // build attendance
    const attendance = buildFinalAttendance(rows);

    // attach phone
    const finalAttendance = attachFacultyPhoneFromExcel(
      attendance,
      facultyPhoneMap
    );

    await saveAttendanceToDB(finalAttendance, Number(branchId));

    res.json({
      success: true,
      message: "Excel imported successfully",
      totalRows: rows.length,
      attendanceCount: finalAttendance.length,
      finalAttendance,
      phoneMap: facultyPhoneMap,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAllHistoricalData = async (req, res) => {
  try {
    const { month, year, id, role } = req.query;

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    if (!id && role === "STAFF") {
      const data = await prisma.historicalStaffData.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });

      res.json({
        message: "All Historical data",
        success: true,
        data,
      });
    }
    if (id && role === "FACULTY") {
      const data = await prisma.historicalFacultyData.findMany({
        where: {
          branchId: Number(id),
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          branch: true,
          batch: true,
          user: true,
        },
      });


      res.json({
        message: "All Historical data",
        success: true,
        data,
      });
    }
  } catch (err) {
    res.json({
      message: err.message,
      success: false,
    });
  }
};

module.exports = { uploadfile, getAllHistoricalData };
