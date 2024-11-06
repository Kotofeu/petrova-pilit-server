const Router = require('express')
const reviewController = require('../controllers/reviewController');
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')
const { body } = require('express-validator');

// Получить свой отзыв по reviewId из cookies
router.get('/', reviewController.getReview)


// Получить все отзывы
router.get('/all', reviewController.getReviews)


// Получить конкретный отзыв
router.get('/:id', reviewController.getReviewById)


// Создать отзыв
router.post('/', reviewController.addReview)


// Создать отзыв, с пометкой "Пользователь с Авито"
router.post('/avito', checkRole('ADMIN'), reviewController.addAvitoReview)


// Обновить свой отзыв по reviewId из cookies
router.post('/update', reviewController.changeById)


// Удалить фотографии deletedIds отзыва reviewId из cookies
router.delete('/images',
    [
        body('deletedIds.*').isInt()
    ],
    reviewController.deleteImageById
)

// Удалить фотографии deletedIds любого отзыва
router.delete('/images-admin',
    [
        body('deletedIds').isArray(),
        body('deletedIds.*').isInt()
    ],
    checkRole('ADMIN'),
    reviewController.deleteImageByIdAdmin
)

// Удалить свой отзыв по reviewId из cookies
router.delete('/', reviewController.delete)


// Удалить конкретный отзыв
router.delete('/:id', checkRole('ADMIN'), reviewController.deleteById)

module.exports = router