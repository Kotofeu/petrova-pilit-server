const { Reviews, ReviewsImages, Users } = require('../models/models');
const ApiError = require('../error/ApiError');
const staticManagement = require('../helpers/staticManagement')
const ReviewDto = require('../dtos/ReviewDto');
const { Op } = require('sequelize');
const tokenService = require('./TokenService');

class ReviewsService {
    async getReview(id) {
        if (!id) {
            throw ApiError.BadRequest('Не указан id отзыва');
        }
        const review = await Reviews.findOne({
            where: { id },
            include: [
                {
                    model: ReviewsImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: Users,
                    attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                }
            ]

        })
        if (!review) {
            throw ApiError.BadRequest('Отзыва с указанным id не существует')
        }
        return new ReviewDto(review)
    }

    async getReviews(limit, page, reviewId) {
        page = page || 1;
        limit = limit || 12;
        let offset = (page - 1) * limit;

        if (!reviewId) {
            const reviews = await Reviews.findAndCountAll({
                limit,
                offset,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: ReviewsImages,
                        attributes: ['id', 'name', 'imageSrc']
                    },
                    {
                        model: Users,
                        attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                    }
                ],
                distinct: true
            });
            return { reviews: reviews }
        }

        const review = await Reviews.findOne({
            where: { id: reviewId },
            include: [
                {
                    model: ReviewsImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: Users,
                    attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                }
            ]
        });

        if (!review) {
            const firstPageReviews = await Reviews.findAndCountAll({
                limit,
                offset: 0,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: ReviewsImages,
                        attributes: ['id', 'name', 'imageSrc']
                    },
                    {
                        model: Users,
                        attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                    }
                ],
                distinct: true
            });
            return { reviews: firstPageReviews, page: 1, found: false };
        }

        const reviewCountBefore = await Reviews.count({
            where: {
                id: { [Op.gt]: reviewId }
            }
        });

        const reviewPage = Math.floor(reviewCountBefore / limit) + 1;

        const reviewsOnPage = await Reviews.findAndCountAll({
            limit,
            offset: (reviewPage - 1) * limit,
            order: [['id', 'DESC']],
            include: [
                {
                    model: ReviewsImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: Users,
                    attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                }
            ],
            distinct: true
        });

        return { reviews: reviewsOnPage, page: reviewPage, found: true };
    }

    async addReview(reviewId, name, rating, comment, refreshToken, images) {
        let userIdForReview;
        let validRating;
        if (reviewId) {
            const oldReview = await Reviews.findOne({ where: { id: reviewId } });
            if (oldReview) {
                throw ApiError.BadRequest(`Вы уже оставляли свой отзыв`);
            }
        }
        if (refreshToken) {
            const { id } = tokenService.validateRefreshToken(refreshToken);
            const user = await Users.findOne({ where: { id } });
            if (!user) {
                throw ApiError.BadRequest(`Не удаётся распознать пользователя ${id}`);
            }
            const oldReview = await Reviews.findOne({ where: { userId: user.id } });
            if (oldReview) {
                throw ApiError.BadRequest(`${user.name ? `${user.name}, ` : ''}Вы уже оставляли свой отзыв`);
            }

            userIdForReview = user.id;
        } else if (name) {
            const user = await Users.create({ name });
            userIdForReview = user.id;
        } else {
            throw ApiError.BadRequest("Не удаётся распознать пользователя");
        }
        if (rating === undefined || isNaN(Number(rating))) {
            throw ApiError.BadRequest("Укажите вашу оценку");
        }

        validRating = Math.max(1, Math.min(5, Number(rating)));
        if (images && images.length > 6) {
            throw ApiError.BadRequest("Вы превысили допустимый лимит в 6 изображений");
        }

        let imagesPaths = [];
        if (images) {
            imagesPaths = await staticManagement.manyStaticCreate(images);
        }

        const review = await Reviews.create({
            rating: validRating,
            comment: comment || null,
            userId: userIdForReview
        });

        await Promise.all(imagesPaths.map(async image => {
            await ReviewsImages.create({
                name: image,
                imageSrc: image,
                reviewId: review.id
            });
        }));
        const newReview = await Reviews.findOne({
            where: { id: review.id },
            include: [
                {
                    model: ReviewsImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: Users,
                    attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                }
            ]
        })
        return new ReviewDto(newReview);
    }

    async addAvitoReview(name, rating, comment, images, userIcon) {
        let validRating;
        let userIconPath = null
        if (!name) {
            throw ApiError.BadRequest("Добавьте имя пользователя");
        }
        if (rating === undefined || isNaN(Number(rating))) {
            throw ApiError.BadRequest("Укажите оценку");
        }
        if (userIcon) {
            userIconPath = await staticManagement.staticCreate(userIcon);
        }
        const user = await Users.create({ name: name, visitsNumber: -1, imageSrc: userIconPath });

        validRating = Math.max(1, Math.min(5, Number(rating)));
        if (images && images.length > 6) {
            throw ApiError.BadRequest("Вы превысили допустимый лимит в 6 изображений");
        }

        let imagesPaths = [];
        if (images) {
            imagesPaths = await staticManagement.manyStaticCreate(images);
        }

        const review = await Reviews.create({
            rating: validRating,
            comment: comment || null,
            userId: user.id
        });

        await Promise.all(imagesPaths.map(async image => {
            await ReviewsImages.create({
                name: image,
                imageSrc: image,
                reviewId: review.id
            });
        }));
        const newReview = await Reviews.findOne({
            where: { id: review.id },
            include: [
                {
                    model: ReviewsImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: Users,
                    attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                }
            ]
        })
        return new ReviewDto(newReview);
    }

    async changeById(reviewId, rating, comment, images, deletedIds, res) {
        let validRating = null;
        let deletedIdsToArray = deletedIds
        if (!reviewId) {
            throw ApiError.BadRequest('Не указан id отзыва');
        }
        if (deletedIds && !Array.isArray(deletedIds)) {
            deletedIdsToArray = [deletedIds]
        }
        if (images && (images.length > 6)) {
            throw ApiError.BadRequest("Вы превысили доспуск в 6 изображений");
        }
        const review = await Reviews.findOne({
            where: { id: reviewId },
            include: [
                {
                    model: ReviewsImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: Users,
                    attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                }
            ]
        });
        if (!review) {
            res.clearCookie('reviewId');
            throw ApiError.NotFound(`Отзыв с id ${id} не существует`);
        }
        if (rating !== undefined && !isNaN(Number(rating))) {
            validRating = Math.max(1, Math.min(5, Number(rating)));
        }
        let deletedImages = []
        if (deletedIdsToArray?.length) {
            deletedImages = await ReviewsImages.findAll({
                where: {
                    [Op.and]: [
                        { id: deletedIdsToArray },
                        { reviewId: reviewId }
                    ]
                }
            })
        }
        const isValid =
            Array.isArray(images)
                ? images.length + review.reviews_images.length - deletedImages.length > 6
                : images ? 1 + review.reviews_images.length - deletedImages.length > 6 : false

        if (isValid) {
            throw ApiError.BadRequest("Вы превысили доспуск в 6 изображений");
        }
        if (validRating) {
            review.rating = validRating
        }
        if (comment) {
            review.comment = comment
        }
        if (deletedImages) {
            await staticManagement.manyStaticDelete(deletedImages);
            await Promise.all(deletedImages.map(async image =>
                await ReviewsImages.destroy({ where: { id: image.id } })
            ));
        }
        let imagesPaths = [];
        if (images) {
            imagesPaths = await staticManagement.manyStaticCreate(images);
            await Promise.all(imagesPaths.map(async (image, index) => {
                await ReviewsImages.create({
                    name: image,
                    imageSrc: image,
                    reviewId: review.id,
                });
            }));
        }
        await review.save();

        const newReview = await Reviews.findOne({
            where: { id: review.id },
            include: [
                {
                    model: ReviewsImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: Users,
                    attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                }
            ],
        });
        return new ReviewDto(newReview);
    }

    async delete(reviewId) {
        if (!reviewId) {
            return 0
        }
        const review = await Reviews.findOne({
            where: { id: reviewId },
            include: [
                {
                    model: ReviewsImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: Users,
                    attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                }
            ]

        })
        if (!review) {
            return 0
        }
        if (review.reviews_images) {
            console.log(review.reviews_images)
            await staticManagement.manyStaticDelete(review.reviews_images);
            await Promise.all(review.reviews_images.map(async image =>
                await ReviewsImages.destroy({ where: { id: image.id } })
            ));
        }

        return await Reviews.destroy({ where: { id: reviewId } });
    }

    async deleteById(id) {
        if (!id) {
            throw ApiError.BadRequest('Не указан id отзыва');
        }
        const review = await Reviews.findOne({
            where: { id },
            include: [
                {
                    model: ReviewsImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: Users,
                    attributes: ['id', 'name', 'email', 'imageSrc', 'visitsNumber']
                }
            ]

        })
        if (!review) {
            throw ApiError.NotFound(`Отзыва с id ${id} не существует`);
        }
        if (review.reviews_images) {
            await staticManagement.manyStaticDelete(review.reviews_images);
            await Promise.all(review.reviews_images.map(async image =>
                await ReviewsImages.destroy({ where: { id: image.id } })
            ));
        }

        return await Reviews.destroy({ where: { id } });
    }

    async deleteImageById(deletedIds, reviewId) {
        let deletedIdsToArray = deletedIds;
        if (!reviewId) {
            throw ApiError.BadRequest('Вы ещё не написали свой отзыв');
        }
        if (!Array.isArray(deletedIds)) {
            deletedIdsToArray = [deletedIds];
        }
        if (deletedIdsToArray?.length) {
            const deletedImages = await ReviewsImages.findAll({
                where: {
                    [Op.and]: [
                        { id: deletedIdsToArray },
                        { reviewId: reviewId }
                    ]
                }
            })
            await staticManagement.manyStaticDelete(deletedImages);
            return await Promise.all(deletedImages.map(async image =>
                await ReviewsImages.destroy({
                    where: {
                        [Op.and]: [
                            { id: image.id },
                            { reviewId: reviewId }
                        ]
                    }
                }),
            ));
        }
        return 0;
    }

    async deleteImageByIdAdmin(deletedIds) {
        let deletedIdsToArray = deletedIds;

        if (!Array.isArray(deletedIds)) {
            deletedIdsToArray = [deletedIds];
        }

        if (deletedIdsToArray?.length) {
            const deletedImages = await ReviewsImages.findAll({ where: { id: deletedIdsToArray } })
            await staticManagement.manyStaticDelete(deletedImages);
            return await Promise.all(deletedImages.map(async image =>
                await ReviewsImages.destroy({ where: { id: image.id } })
            ));
        }
        return 0;
    }
}
module.exports = new ReviewsService();