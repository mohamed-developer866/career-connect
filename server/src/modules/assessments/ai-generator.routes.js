const router = require('express').Router();
const ctrl = require('./ai-generator.controller');
const auth = require('../../middlewares/auth');

router.post('/', auth, ctrl.generate);

module.exports = router;