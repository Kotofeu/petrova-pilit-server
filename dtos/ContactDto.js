module.exports = class ContactDto {
    id;
    name;
    link;
    imageSrc;
    constructor(model) {
        this.id = model.id;
        this.name = model.name;
        this.imageSrc = model.imageSrc;
        this.link = model.link;
    }
}