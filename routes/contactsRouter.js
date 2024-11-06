const Router = require('express')
const contactController = require('../controllers/contactController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')

router.get('/', contactController.getContacts)
router.post('/', checkRole('ADMIN'), contactController.addContact)
router.post('/:id', checkRole('ADMIN'), contactController.changeById)
router.delete('/:id', checkRole('ADMIN'), contactController.deleteById)


module.exports = router