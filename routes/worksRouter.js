const Router = require('express')
const workController = require('../controllers/workController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')
const { body } = require('express-validator');

router.get('/', workController.getWorks)
router.get('/:id', workController.getWorkById)
router.post('/', checkRole('ADMIN'), workController.addWork)
router.post('/:id', checkRole('ADMIN'), workController.changeById)
router.delete('/images',
    [
        body('deletedIds').isArray(),
        body('deletedIds.*').isInt()
    ],
    checkRole('ADMIN'), workController.deleteImageById)
router.delete('/:id', checkRole('ADMIN'), workController.deleteById)


module.exports = router