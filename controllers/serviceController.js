const servicesService = require('../service/ServicesService');
const ServiceDto = require('../dtos/ServiceDto');
class ServiceController {

    async getServices(req, res, next) {
        try {
            const services = await servicesService.getServices();
            return res.json(services);
        } catch (e) {
            next(e);
        }
    }

    async addService(req, res, next) {
        try {
            const serviceDto = new ServiceDto(req.body);
            const service = await servicesService.addService(serviceDto);
            return res.json(service);
        } catch (e) {
            next(e);
        }
    }
    async changeById(req, res, next) {
        try {
            const { id } = req.params
            const serviceDto = new ServiceDto(req.body);
            const service = await servicesService.changeById(id, serviceDto);
            return res.json(service);
        } catch (e) {
            next(e);
        }
    }
    async deleteById(req, res, next) {
        try {
            const { id } = req.params
            const service = await servicesService.deleteById(id);
            return res.json(service);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new ServiceController();