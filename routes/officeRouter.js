const Router = require('express')
const officeController = require('../controllers/officeController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')

router.get('/', officeController.getImages)
router.post('/', checkRole('ADMIN'), officeController.addImages)
router.delete('/:id', checkRole('ADMIN'), officeController.deleteById)


module.exports = router