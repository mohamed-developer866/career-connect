const router = require('express').Router();
const ctrl = require('./auth.controller');

router.post('/send-otp', ctrl.sendOTP);
router.post('/verify-otp', ctrl.verifyOTP);
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/reset-password', ctrl.resetPassword);

module.exports = router;