const Router = require('express')
const advantageController = require('../controllers/advantageController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')

router.get('/', advantageController.getAdvantages)
router.post('/', checkRole('ADMIN'), advantageController.addAdvantage)
router.post('/:id', checkRole('ADMIN'), advantageController.changeById)
router.delete('/:id', checkRole('ADMIN'), advantageController.deleteById)


module.exports = router