const Router = require('express')
const serviceController = require('../controllers/serviceController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')

router.get('/', serviceController.getServices)
router.post('/', checkRole('ADMIN'), serviceController.addService)
router.post('/:id', checkRole('ADMIN'), serviceController.changeById)
router.delete('/:id', checkRole('ADMIN'), serviceController.deleteById)


module.exports = router