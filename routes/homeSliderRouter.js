const Router = require('express')
const homeSliderController = require('../controllers/homeSliderController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')

router.get('/', homeSliderController.getImages)
router.post('/', checkRole('ADMIN'), homeSliderController.addImages)
router.delete('/:id', checkRole('ADMIN'), homeSliderController.deleteById)


module.exports = router