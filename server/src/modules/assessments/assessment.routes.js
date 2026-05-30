const router = require('express').Router();
const ctrl = require('./assessment.controller');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

module.exports = router;