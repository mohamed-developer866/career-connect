const router = require('express').Router();
const ctrl = require('./chatbot.controller');
const zaraCtrl = require('./zara.controller');
const zaraCodeCtrl = require('./zara-code.controller');
const auth = require('../../middlewares/auth');

router.post('/', ctrl.ask);
router.get('/zara/tip', auth, zaraCtrl.getTip);
router.post('/zara-code', auth, zaraCodeCtrl.getCodeHelp);

module.exports = router;