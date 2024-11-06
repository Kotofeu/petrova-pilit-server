const { WorkTypes } = require('../models/models');
const ApiError = require('../error/ApiError');

class WorkTypesService {
    async getWorkTypes() {
        const workTypes = await WorkTypes.findAndCountAll({ order: [['id', 'ASC']] });
        return workTypes;
    }
    async addWorkType(name) {
        if (!name) {
            throw ApiError.BadRequest(`Название для типа работы отсутствует`);
        }
        const candidate = await WorkTypes.findOne({ where: { name } })
        if (candidate) {
            throw ApiError.BadRequest(`Тип работы с названием ${name} уже существует`);
        }
        const workType = await WorkTypes.create({ name: name })
        return (workType)
    }
    async changeById(id, name) {
        if (!id) {
            throw ApiError.BadRequest('Не указан id типа работы');
        }
        if (!name) {
            throw ApiError.BadRequest(`Новое название для типа работы отсутствует`);
        }
        const workType = await WorkTypes.findOne({ where: { id } })
        if (!workType) {
            throw ApiError.NotFound(`Тип работы с id ${id} не существует`);
        }
        const candidate = await WorkTypes.findOne({ where: { name } })
        if (candidate && candidate.id !== workType.id) {
            throw ApiError.BadRequest(`Тип работы с названием ${name} уже существует`);
        }
        workType.name = name
        await workType.save()

        return (workType)
    }
    async deleteById(id) {
        const workType = await WorkTypes.findOne({ where: { id } });
        if (!workType) {
            throw ApiError.NotFound(`Тип работы с id ${id} не существует`);
        }
        return await WorkTypes.destroy({ where: { id } });
    }
}
module.exports = new WorkTypesService();