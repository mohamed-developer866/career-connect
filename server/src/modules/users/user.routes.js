const router = require('express').Router();
const ctrl = require('./user.controller');
const auth = require('../../middlewares/auth');

router.get('/stats', auth, ctrl.getStats);
router.get('/dashboard', auth, ctrl.getDashboard);

module.exports = router;