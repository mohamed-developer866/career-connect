var router = require('express').Router();
var ctrl = require('./skill.controller');
var auth = require('../../middlewares/auth');

router.post('/calculate', auth, ctrl.calculateSkills);
router.get('/my', auth, ctrl.getMySkills);
router.get('/college-rankings', auth, ctrl.getCollegeRankings);

module.exports = router;