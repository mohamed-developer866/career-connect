const router = require('express').Router();
const ctrl = require('./zara-tasks.controller');
const auth = require('../../middlewares/auth');

router.post('/generate', auth, ctrl.getTasks);

module.exports = router;