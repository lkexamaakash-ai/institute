const lectureService = require("./lectures.service");

const create = async (req, res) => {
  try {
    const {
      facultyId,
      subjectId,
      batchId,
      StartDate,
      EndDate,
      startTime,
      endTime,
      TotalScheduled,
    } = req.body;

    if (
      !facultyId ||
      !subjectId ||
      !batchId ||
      !StartDate ||
      !EndDate ||
      !startTime ||
      !endTime ||
      !TotalScheduled
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const lecture = await lectureService.createlectureSchedule(
      {
        facultyId: Number(facultyId),
        subjectId: Number(subjectId),
        batchId: Number(batchId),
        StartDate,
        EndDate,
        startTime,
        endTime,
        TotalScheduled,
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Lecture scheduled successfully",
      data: lecture,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getByBranchAndDate = async (req, res) => {
  try {
    const batchId = Number(req.params.batchId);
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({
        message: "Date query parameter is required",
      });
    }

    const lectures = await lectureService.getLectureByBranchAndDate(
      batchId,
      date
    );

    res.json({
      success: true,
      data: lectures,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const getAlllectures = async (req, res) => {
  try {
    const lectures = await lectureService.getAllLecture();

    res.json({
      success: true,
      data: lectures,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await lectureService.deleteLecture(id);

    res.json({
      success: true,
      data,
      message: "Lecture deleted",
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      facultyId,
      subjectId,
      batchId,
      StartDate,
      EndDate,
      startTime,
      endTime,
      TotalScheduled,
    } = req.body;

    const data = await lectureService.updateLecture(
      id,
      facultyId,
      subjectId,
      batchId,
      StartDate,
      EndDate,
      startTime,
      endTime,
      TotalScheduled
    );

    res.json({
      success: true,
      message: "Update Lecture",
      data,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

module.exports = {
  create,
  getByBranchAndDate,
  getAlllectures,
  remove,
  update,
};
