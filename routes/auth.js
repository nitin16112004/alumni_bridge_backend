const router = require('express').Router();
const auth = require('../middleware/auth');
const { registerUser, registerCollege, login, getMe } = require('../controllers/authController');
const { sendOtp, verifyOtp, forgotPassword, resetPassword } = require('../controllers/otpController');

router.post('/register', registerUser);
router.post('/register-college', registerCollege);
router.post('/login', login);
router.get('/me', auth, getMe);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
