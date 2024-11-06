const worksService = require('../service/WorksService');
const WorkDto = require('../dtos/WorkDto');
const ApiError = require('../error/ApiError');

const { validationResult } = require('express-validator');

class WorkController {

    async getWorks(req, res, next) {
        try {
            let {
                limit,
                page,
                typeId
            } = req.query;
            const works = await worksService.getWorks(limit, page, typeId);
            return res.json(works);
        } catch (e) {
            next(e);
        }
    }
    async getWorkById(req, res, next) {
        try {
            const { id } = req.params
            const work = await worksService.getWorkById(id);
            return res.json(work);
        } catch (e) {
            next(e);
        }
    }

    async addWork(req, res, next) {
        try {
            let imageAfter;
            let imageBefore;
            let otherImages;
            if (req.files) {
                if (req.files.imageAfter) {
                    imageAfter = req.files.imageAfter
                }
                if (req.files.imageBefore) {
                    imageBefore = req.files.imageBefore

                }
                if (req.files.otherImages) {
                    otherImages = req.files.otherImages
                }
            }
            const workDto = new WorkDto(req.body);
            const { typeId } = req.body;
            const work = await worksService.addWork(workDto, typeId, imageAfter, imageBefore, otherImages);
            return res.json(work);
        } catch (e) {
            next(e);
        }
    }
    async changeById(req, res, next) {
        try {
            const { id } = req.params
            let imageAfter;
            let imageBefore;
            let otherImages;
            if (req.files) {
                if (req.files.imageAfter) {
                    imageAfter = req.files.imageAfter
                }
                if (req.files.imageBefore) {
                    imageBefore = req.files.imageBefore

                }
                if (req.files.otherImages) {
                    otherImages = req.files.otherImages
                }
            }
            const workDto = new WorkDto(req.body);
            const { typeId } = req.body;
            const { deletedIds } = req.body;
            const work = await worksService.changeById(id, workDto, typeId, imageAfter, imageBefore, otherImages, deletedIds);
            return res.json(work);
        } catch (e) {
            next(e);
        }
    }
    async deleteById(req, res, next) {
        try {
            const { id } = req.params
            const work = await worksService.deleteById(id);
            return res.json(work);
        } catch (e) {
            next(e);
        }
    }
    async deleteImageById(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при массива удаляемых изображений'))
            }
            const { deletedIds } = req.body
            const work = await worksService.deleteImageById(deletedIds);
            return res.json(work);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new WorkController();