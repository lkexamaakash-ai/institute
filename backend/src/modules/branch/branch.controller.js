const branchService = require("./branch.service");

const create = async (req, res) => {
  try {
    const { name, userId } = req.body;

    if (!name) {
      return res.status(401).json({
        message: "Branch name is required",
      });
    }

    const branch = await branchService.createBranch(name, userId);

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const branches = await branchService.getAllBranch();
    res.json({
      success: true,
      data: branches,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const branch = await branchService.getBranchById(id);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(201).json({
      success: true,
      data: branch,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Branch name is required" });
    }

    const branch = await branchService.updateBranch(id, name);

    res.json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
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
    await branchService.deleteBranch(id);

    res.json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
};
