const { Services } = require('../models/models');
const ApiError = require('../error/ApiError');
const ServiceDto = require('../dtos/ServiceDto');
class ServicesService {

    async getServices() {
        const services = await Services.findAndCountAll({ order: [['price', 'DESC']] });
        return services;
    }
    async addService(serviceDto) {
        const serviceValues = new ServiceDto(serviceDto)
        if (!serviceValues.name || !serviceValues.description) {
            throw ApiError.BadRequest(`Данные для услуги отсутствуют (name, description)`);
        }
        const candidate = await Services.findOne({ where: { name: serviceValues.name } })
        if (candidate) {
            throw ApiError.BadRequest(`Услуга с названием ${serviceValues.name} уже существует`);
        }
        const service = await Services.create({
            name: serviceValues.name,
            description: serviceValues.description,
            time: Number(serviceValues.time) >= 0 ? Number(serviceValues.time) : 0,
            price: Number(serviceValues.price) >= 0 ? Number(serviceValues.price) : 0,
        })
        return new ServiceDto(service)
    }
    async changeById(id, serviceDto) {
        const serviceValues = new ServiceDto(serviceDto)
        if (!id) {
            throw ApiError.BadRequest('Не указан id услуги');
        }

        const service = await Services.findOne({ where: { id } })
        if (!service) {
            throw ApiError.NotFound(`Услуга с id ${id} не существует`);
        }

        if (serviceValues.name) {
            const candidate = await Services.findOne({ where: { name: serviceValues.name } })
            if (candidate && service.id !== candidate.id) {
                throw ApiError.BadRequest(`Услуга с названием ${serviceValues.name} уже существует`);
            }
        }

        Object.keys(serviceValues).forEach(key => {
            if (serviceValues[key]) {
                service[key] = serviceValues[key];
            }
        });
        await service.save()
        return new ServiceDto(service)
    }
    async deleteById(id) {
        const service = await Services.findOne({ where: { id } });
        if (!service) {
            throw ApiError.NotFound(`Услуга с id ${id} не существует`);
        }
        return await Services.destroy({ where: { id } });
    }
}
module.exports = new ServicesService();