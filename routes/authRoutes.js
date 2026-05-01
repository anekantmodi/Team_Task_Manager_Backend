const express = require('express');
const { register, login, getMe, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, getAllUsers);

module.exports = router;
