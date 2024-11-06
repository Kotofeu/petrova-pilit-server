const { Advantages } = require('../models/models');
const ApiError = require('../error/ApiError');
const staticManagement = require('../helpers/staticManagement')
const AdvantageDto = require('../dtos/AdvantageDto');
const { Op } = require('sequelize');
class AdvantagesService {

    async getAdvantages() {
        const advantages = await Advantages.findAndCountAll({ order: [['id', 'ASC']] });
        return advantages;
    }
    async addAdvantage(advantageDto, icon, image) {
        const advantagesValues = new AdvantageDto(advantageDto)
        if (!icon || !advantagesValues.name || !advantagesValues.description) {
            throw ApiError.BadRequest(`Данные для преимущества отсутствуют (name, description, icon)`);
        }
        const candidate = await Advantages.findOne({
            where: {
                [Op.or]: [
                    { name: advantagesValues.name },
                    { description: advantagesValues.description }
                ]
            }
        });
        if (candidate) {
            throw ApiError.BadRequest(`Преимущество с таким названием или описанием уже существует`);
        }
        const iconName = await staticManagement.staticCreate(icon);
        let imageName = null
        if (image) {
            imageName = await staticManagement.staticCreate(image);
        }
        const advantage = await Advantages.create({
            name: advantagesValues.name,
            description: advantagesValues.description,
            iconSrc: iconName,
            imageName: imageName,
        })
        return new AdvantageDto(advantage)
    }
    async changeById(id, advantageDto, icon, image) {
        const advantagesValues = new AdvantageDto(advantageDto)
        if (!id) {
            throw ApiError.BadRequest('Не указан id преимущества');
        }
        const advantage = await Advantages.findOne({ where: { id } })
        if (!advantage) {
            throw ApiError.NotFound(`Преимущество с id ${id} не существует`);
        }

        if (advantagesValues.name) {
            const candidate = await Advantages.findOne({
                where: { name: advantagesValues.name }
            });
            if (candidate && advantage.id !== candidate.id) {
                throw ApiError.BadRequest(`Преимущество с таким названием или описанием уже существует`);
            }
        }

        if (advantagesValues.description) {
            const candidate = await Advantages.findOne({
                where: { description: advantagesValues.description }
            });
            if (candidate && advantage.id !== candidate.id) {
                throw ApiError.BadRequest(`Преимущество с таким названием или описанием уже существует`);
            }
        }


        Object.keys(advantagesValues).forEach(key => {
            if (advantagesValues[key]) {
                advantage[key] = advantagesValues[key];
            }
        });
        if (icon) {
            const iconName = await staticManagement.staticCreate(icon);
            await staticManagement.staticDelete(advantage.iconSrc);
            advantage.iconSrc = iconName;
        }
        if (image) {
            const fileName = await staticManagement.staticCreate(image);
            await staticManagement.staticDelete(advantage.imageSrc);
            advantage.imageSrc = fileName;
        }
        await advantage.save()
        return new AdvantageDto(advantage)
    }
    async deleteById(id) {
        const advantage = await Advantages.findOne({ where: { id } });
        if (!advantage) {
            throw ApiError.NotFound(`Преимущество с id ${id} не существует`);
        }
        await staticManagement.staticDelete(advantage.imageSrc);
        await staticManagement.staticDelete(advantage.iconSrc);
        return await Advantages.destroy({ where: { id } });
    }
}
module.exports = new AdvantagesService();