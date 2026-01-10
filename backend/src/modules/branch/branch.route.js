const express = require('express');
const router = express.Router();

const branchController = require('./branch.controller');
const {protect} = require('../../middleware/auth.middleware');
const {requireRole} = require('../../middleware/role.middleware');

router.post(
    '/',
    protect,
    requireRole('SUPER_ADMIN'),
    branchController.create
)

router.get(
    '/',
    protect,
    branchController.getAll
)

router.get(
    "/:id",
    protect,
    branchController.getOne
)

router.put(
    "/:id",
    protect,
    requireRole("SUPER_ADMIN"),
    branchController.update
)

router.delete(
    "/:id",
    protect,
    requireRole("SUPER_ADMIN"),
    branchController.remove
)

module.exports = router