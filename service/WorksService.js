const { Works, WorksImages, WorkTypes } = require('../models/models');
const ApiError = require('../error/ApiError');
const staticManagement = require('../helpers/staticManagement')
const WorkDto = require('../dtos/WorkDto');
const { Op } = require('sequelize');

class WorksService {

    async getWorks(limit, page, typeId) {
        page = page || 1;
        limit = limit || 12;
        let offset = (page - 1) * limit;
        if (typeId) {
            return await Works.findAndCountAll({
                where: { typeId },
                limit,
                offset,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: WorkTypes,
                        attributes: ['id', 'name']
                    }
                ],
                distinct: true
            });
        }

        return await Works.findAndCountAll({
            limit,
            offset,
            order: [['id', 'DESC']],
            include: [
                {
                    model: WorkTypes,
                    attributes: ['id', 'name']
                }
            ],
            distinct: true
        });
    }
    async getWorkById(id) {
        if (!id) {
            throw ApiError.BadRequest(`Не указан id работы`);
        }
        const work = await Works.findOne({
            where: { id },
            include: [
                {
                    model: WorksImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: WorkTypes,
                    attributes: ['id', 'name']
                }
            ],
        })
        if (!work) {
            throw ApiError.NotFound(`Работы с id ${id} не существует`);
        }
        return new WorkDto(work)
    }

    async addWork(workDto, typeId, imageAfter, imageBefore, otherImages) {
        const workValues = new WorkDto(workDto);

        if (!imageAfter && !imageBefore) {
            throw ApiError.BadRequest("Укажите изображение до и/или изображение после");
        }
        if (!workValues.name || !workValues.description) {
            throw ApiError.BadRequest("Укажите название и описание работы");
        }
        if (typeId) {
            const type = await WorkTypes.findOne({ where: { id: typeId } })
            if (!type) {
                throw ApiError.NotFound("Указанный тип работы не найден");
            }
        }
        if (otherImages && (otherImages.length > 12)) {
            throw ApiError.BadRequest("Вы превысили доспуск в 12 изображений");
        }
        if (imageAfter && (imageAfter.length > 1)) {
            throw ApiError.BadRequest("Вы передали больше 1 изображения в раздел после");
        }
        if (imageBefore && (imageBefore.length > 1)) {
            throw ApiError.BadRequest("Вы передали больше 1 изображения в раздел до");
        }
        let imageAfterPath = null;
        let imageBeforePath = null;
        let otherImagesPaths = [];
        if (otherImages) {
            otherImagesPaths = await staticManagement.manyStaticCreate(otherImages);
        }
        if (imageAfter) {
            imageAfterPath = await staticManagement.staticCreate(imageAfter);
        }
        if (imageBefore) {
            imageBeforePath = await staticManagement.staticCreate(imageBefore);
        }


        const work = await Works.create({
            name: workValues.name,
            description: workValues.description,
            imageAfterSrc: imageAfterPath,
            imageBeforeSrc: imageBeforePath,
            typeId: typeId || null
        });

        await Promise.all(otherImagesPaths.map(async (image, index) => {
            await WorksImages.create({
                name: `${workValues.name}: ${index + 1}`,
                imageSrc: image,
                workId: work.id
            });
        }));

        return new WorkDto(work);
    }

    async changeById(id, workDto, typeId, imageAfter, imageBefore, otherImages, deletedIds) {
        const workValues = new WorkDto(workDto);
        let deletedIdsToArray = deletedIds

        if (!id) {
            throw ApiError.BadRequest('Не указан id работы');
        }
        if (deletedIds && !Array.isArray(deletedIds)) {
            deletedIdsToArray = [deletedIds]
        }
        if (otherImages && (otherImages.length > 12)) {
            throw ApiError.BadRequest("Вы превысили доспуск в 12 изображений");
        }
        if (imageAfter && (imageAfter.length > 1)) {
            throw ApiError.BadRequest("Вы передали больше 1 изображения в раздел после");
        }
        if (imageBefore && (imageBefore.length > 1)) {
            throw ApiError.BadRequest("Вы передали больше 1 изображения в раздел до");
        }
        const work = await Works.findOne({
            where: { id },
            include: [
                {
                    model: WorksImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
            ],
        });
        if (!work) {
            throw ApiError.NotFound(`Работа с id ${id} не существует`);
        }
        let deletedImages = []
        if (deletedIdsToArray?.length) {
            deletedImages = await WorksImages.findAll({
                where: {
                    [Op.and]: [
                        { id: deletedIdsToArray },
                        { workId: work.id }
                    ]
                }
            })
        }
        const isValid =
            Array.isArray(otherImages)
                ? otherImages.length + work.works_images.length - deletedImages.length > 12
                : otherImages ? 1 + work.works_images.length - deletedImages.length > 12 : false

        if (isValid) {
            throw ApiError.BadRequest("Вы превысили доспуск в 12 изображений");
        }
        if (deletedImages) {
            await staticManagement.manyStaticDelete(deletedImages);
            await Promise.all(deletedImages.map(async image =>
                await WorksImages.destroy({ where: { id: image.id } })
            ));
        }
        if (typeId) {
            const type = await WorkTypes.findOne({ where: { id: typeId } });
            if (!type) {
                throw ApiError.NotFound("Указанный тип работы не найден");
            }
            work.typeId = typeId
        }

        Object.keys(workValues).forEach(key => {
            if (workValues[key]) {
                work[key] = workValues[key];
            }
        });
        if (imageAfter) {
            const imageAfterPath = await staticManagement.staticCreate(imageAfter);
            await staticManagement.staticDelete(work.imageAfterSrc);
            work.imageAfterSrc = imageAfterPath;
        }

        if (imageBefore) {
            const imageBeforePath = await staticManagement.staticCreate(imageBefore);
            await staticManagement.staticDelete(work.imageBeforeSrc);
            work.imageBeforeSrc = imageBeforePath;
        }

        let otherImagesPaths = [];
        if (otherImages) {
            otherImagesPaths = await staticManagement.manyStaticCreate(otherImages);
            await Promise.all(otherImagesPaths.map(async (image, index) => {
                await WorksImages.create({
                    name: `${workValues.name}: ${index + 1}`,
                    imageSrc: image,
                    workId: work.id,
                });
            }));
        }
        await work.save();
        const newWork = await Works.findOne({
            where: { id: work.id },
            include: [
                {
                    model: WorksImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
                {
                    model: WorkTypes,
                    attributes: ['id', 'name']
                }
            ],
        });
        return new WorkDto(newWork);
    }


    async deleteById(id) {
        if (!id) {
            throw ApiError.BadRequest('Не указан id работы');
        }
        const work = await Works.findOne({
            where: { id },
            include: [
                {
                    model: WorksImages,
                    attributes: ['id', 'name', 'imageSrc']
                },
            ],
        });
        if (!work) {
            throw ApiError.NotFound(`Работа с id ${id} не существует`);
        }
        if (work.works_images) {
            await staticManagement.manyStaticDelete(work.works_images);
            await Promise.all(work.works_images.map(async image =>
                await WorksImages.destroy({ where: { id: image.id } })
            ));
        }
        await staticManagement.staticDelete(work.imageAfterSrc);
        await staticManagement.staticDelete(work.imageBeforeSrc);
        return await Works.destroy({ where: { id } });
    }

    async deleteImageById(deletedIds) {
        let deletedIdsToArray = deletedIds;

        if (!Array.isArray(deletedIds)) {
            deletedIdsToArray = [deletedIds];
        }
        if (deletedIdsToArray?.length) {
            const deletedImages = await WorksImages.findAll({ where: { id: deletedIdsToArray } })
            await staticManagement.manyStaticDelete(deletedImages);
            return await Promise.all(deletedImages.map(async image =>
                await WorksImages.destroy({ where: { id: image.id } })
            ));
        }
        return 0;
    }
}
module.exports = new WorksService();