const express = require('express')
const router = express.Router();
const {login, register, bulkRegister, AdminRegister, changingPass} = require('./auth.controller');
const { protect } = require('../../middleware/auth.middleware');


router.post('/register',register);
router.post('/register_super',AdminRegister)
router.post('/login',login);
router.put("/changepass/:id",protect,changingPass)
router.post(
    '/register/bulk',
    protect,
    bulkRegister
)

module.exports = router;