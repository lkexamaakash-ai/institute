const subjectService = require("./subject.service");

const create = async (req, res) => {
  try {
    const { name, batchId } = req.body;

    if (!name || !batchId) {
      return res.status(400).json({
        message: "name and batchId are required",
      });
    }

    const subject = await subjectService.createSubject(name, Number(batchId));

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const subjects = await subjectService.getAllSubjects();

    res.json({
      success: true,
      data: subjects,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const assignSubjectToFaculty = async (req, res) => {
  try {
    const { facultyId, subjectId, branchId } = req.body;

    if (!facultyId || !subjectId || !branchId) {
      return res.status(400).json({
        message: "facultyId, subjectId and branchId are required",
      });
    }

    const mapping = await subjectService.mapFacultyToSubject({
      facultyId: Number(facultyId),
      subjectId: Number(subjectId),
      branchId: Number(branchId),
    });

    res.status(201).json({
      success: true,
      message: "Subject assigned to faculty successfully",
      data: mapping,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const listSubjectsByfaculty = async (req, res) => {
  try {
    const facultyId = Number(req.params.facultyId);

    const data = await subjectService.getSubjectByFaculty(facultyId);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await subjectService.deleteSub(id);

    res.json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  create,
  getAll,
  assignSubjectToFaculty,
  listSubjectsByfaculty,
  remove,
};
