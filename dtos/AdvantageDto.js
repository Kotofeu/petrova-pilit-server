module.exports = class AdvantageDto {
    id;
    name;
    description;
    iconSrc;
    imageSrc;
    constructor(model) {
        this.id = model.id;
        this.name = model.name;
        this.description = model.description;
        this.iconSrc = model.iconSrc;
        this.imageSrc = model.imageSrc;
    }
}