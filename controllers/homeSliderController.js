const homeSliderService = require('../service/HomeSliderService');

class HomeSliderController {

    async getImages(req, res, next) {
        try {
            const images = await homeSliderService.getImages();
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
            const images = await homeSliderService.addImages(uploadImages);
            return res.json(images);
        } catch (e) {
            next(e);
        }
    }
    async deleteById(req, res, next) {
        try {
            const { id } = req.params
            const images = await homeSliderService.deleteById(id);
            return res.json(images);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new HomeSliderController();