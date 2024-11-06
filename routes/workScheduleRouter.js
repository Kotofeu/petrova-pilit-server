const Router = require('express')
const workScheduleController = require('../controllers/workScheduleController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')

router.get('/', workScheduleController.getWorkSchedule)
router.post('/:id', checkRole('ADMIN'), workScheduleController.changeWorkSchedule)

module.exports = router