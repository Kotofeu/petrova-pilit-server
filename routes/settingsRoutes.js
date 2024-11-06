const Router = require('express')
const settingController = require('../controllers/settingController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')

router.get('/', settingController.getSettings)
router.post('/:key', checkRole('ADMIN'), settingController.changeSetting)

module.exports = router