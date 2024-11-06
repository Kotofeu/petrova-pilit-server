const Router = require('express')
const workTypeController = require('../controllers/workTypeController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')

router.get('/', workTypeController.getWorkTypes)
router.post('/', checkRole('ADMIN'), workTypeController.addWorkType)
router.post('/:id', checkRole('ADMIN'), workTypeController.changeById)
router.delete('/:id', checkRole('ADMIN'), workTypeController.deleteById)


module.exports = router