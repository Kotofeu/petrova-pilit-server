module.exports = class ReviewDto {
    id;
    user;
    comment;
    time;
    rating;
    reviews_images;

    constructor(model) {
        this.id = model.id;
        this.user = model.user;
        this.comment = model.comment;
        this.updatedAt = model.updatedAt;
        this.rating = model.rating;
        this.reviews_images = model.reviews_images;
    }
}