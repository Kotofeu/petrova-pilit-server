module.exports = class ServiceDto {
    id;
    name;
    time;
    price;
    description;
    constructor(model) {
        this.id = model.id;
        this.name = model.name;
        this.time = model.time;
        this.price = model.price;
        this.description = model.description;
    }
}