const ApiError = require('../error/ApiError');
const reviewsService = require('../service/ReviewsService');
const ReviewDto = require('../dtos/ReviewDto');
const { validationResult } = require('express-validator');

class ReviewController {

    async getReview(req, res, next) {
        try {
            const { reviewId } = req.cookies;
            const review = await reviewsService.getReview(reviewId);
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }

    async getReviews(req, res, next) {
        try {
            const { limit, page, reviewId } = req.query;
            const reviews = await reviewsService.getReviews(limit, page, reviewId);
            return res.json(reviews);
        } catch (e) {
            next(e);
        }
    }
    async getReviewById(req, res, next) {
        try {
            const { id } = req.params
            const review = await reviewsService.getReview(id);
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }

    async addReview(req, res, next) {
        try {
            const { reviewId, refreshToken } = req.cookies;
            let images;
            if (req.files && req.files.images) {
                images = req.files.images
            }
            const { name, rating, comment } = req.body;
            const review = await reviewsService.addReview(reviewId, name, rating, comment, refreshToken, images)
            res.cookie('reviewId', review.id, { httpOnly: true, secure: true  })
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }

    async addAvitoReview(req, res, next) {
        try {
            let images;
            let userIcon;
            if (req.files) {
                if (req.files.images) {
                    images = req.files.images
                }
                if (req.files.userIcon) {
                    userIcon = req.files.userIcon
                }
            }
            const { name, rating, comment } = req.body;
            const review = await reviewsService.addAvitoReview(name, rating, comment, images, userIcon)
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }
    async changeById(req, res, next) {
        try {
            const { reviewId } = req.cookies;
            let images;
            if (req.files && req.files.images) {
                images = req.files.images
            }
            const { rating, comment, deletedIds } = req.body;
            const review = await reviewsService.changeById(reviewId, rating, comment, images, deletedIds, res)
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }
    async delete(req, res, next) {
        try {
            const { reviewId } = req.cookies;
            const review = await reviewsService.delete(reviewId);
            res.clearCookie('reviewId');
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }
    async deleteById(req, res, next) {
        try {
            const { id } = req.params
            const review = await reviewsService.deleteById(id);
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }
    async deleteImageById(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при массива удаляемых изображений'))
            }
            const { reviewId } = req.cookies;
            const { deletedIds } = req.body
            const review = await reviewsService.deleteImageById(deletedIds, reviewId);
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }
    async deleteImageByIdAdmin(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при массива удаляемых изображений'))
            }
            const { deletedIds } = req.body
            const review = await reviewsService.deleteImageByIdAdmin(deletedIds);
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new ReviewController();