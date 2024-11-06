module.exports = class UserDto {
    id;
    name;
    imageSrc;
    visitsNumber;
    email;
    phone;
    role;
    review;
    constructor(model) {
        this.id = model.id;
        this.name = model.name;
        this.imageSrc = model.imageSrc;
        this.visitsNumber = model.visitsNumber;
        this.email = model.email;
        this.phone = model.phone;
        this.role = model.role;
        this.review = model.review
    }
}