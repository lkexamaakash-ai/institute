const {prisma} = require('../../config/db')


// CREATE BATCH
const createBatch = async ({ name, code, branchId }) => {
  return await prisma.batch.create({
    data: {
      name,
      code,
      branchId: Number(branchId),
    },
  });
};

// GET ALL BATCHES (optional branch filter)
const getBatches = async () => {
  return await prisma.batch.findMany({
    include: {
      branch: {
        include:{
          users:true
        }
      },
      lectureSchedules:{
        include:{
          subject:true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
};

// GET SINGLE BATCH
const getBatchById = async (id) => {
  return await prisma.batch.findUnique({
    where: { id: Number(id) },
    include: {
      branch: true,
      subjects: true,
    },
  });
};

// UPDATE BATCH
const updateBatch = async (id, data) => {
  return await prisma.batch.update({
    where: { id: Number(id) },
    data,
  });
};

// DELETE BATCH
const deleteBatch = async (id) => {
  return await prisma.batch.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
};