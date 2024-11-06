const officeService = require('../service/OfficeService');

class OfficeController {

    async getImages(req, res, next) {
        try {
            const images = await officeService.getImages();
            return res.json(images);
        } catch (e) {
            next(e);
        }
    }

    async addImages(req, res, next) {
        try {

            let uploadImages;
            if (req.files && req.files.images) {
                uploadImages = req.files.images
            }
            const images = await officeService.addImages(uploadImages);
            return res.json(images);
        } catch (e) {
            next(e);
        }
    }
    async deleteById(req, res, next) {
        try {
            const { id } = req.params
            const images = await officeService.deleteById(id);
            return res.json(images);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new OfficeController();