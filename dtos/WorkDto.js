module.exports = class WorkDto {
    id;
    imageAfterSrc;
    imageBeforeSrc;
    name;
    description;
    workType;
    images;
    createdAt;
    constructor(model) {
        this.id = model.id;
        this.imageAfterSrc = model.imageAfterSrc;
        this.imageBeforeSrc = model.imageBeforeSrc;
        this.name = model.name;
        this.description = model.description;
        this.workType = model.work_type;
        this.images = model.works_images;
        this.createdAt = model.createdAt
    }
}