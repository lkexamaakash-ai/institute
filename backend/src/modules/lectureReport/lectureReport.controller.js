const { getPenaltyReport } = require("./lectureReport.service");

const penaltyReport = async (req, res) => {
  try {
    const { branchId, facultyId, month, year } = req.query;

    if (!branchId || !month || !year) {
      return res.status(400).json({
        message: "branchId, month and year are required",
      });
    }

    const data = await getPenaltyReport({
      branchId: Number(branchId),
      facultyId: facultyId ? Number(facultyId) : null,
      month: Number(month),
      year: Number(year),
      currentUser: req.user,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

module.exports = { penaltyReport };
