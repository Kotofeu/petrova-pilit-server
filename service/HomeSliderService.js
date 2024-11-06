const { HomeSlider } = require('../models/models');
const ApiError = require('../error/ApiError');
const staticManagement = require('../helpers/staticManagement')
class HomeSliderService {

    async getImages() {
        const images = await HomeSlider.findAndCountAll();
        return images;
    }
    async addImages(images) {

        let imagesPaths = [];
        if (images) {
            imagesPaths = await staticManagement.manyStaticCreate(images);
        }
        else {
            throw ApiError.BadRequest('Изображения не переданы');
        }
        await Promise.all(imagesPaths.map(async image => {
            await HomeSlider.create({
                name: image,
                imageSrc: image,
            });
        }));
        return imagesPaths.length

    }
    async deleteById(id) {
        const image = await HomeSlider.findOne({ where: { id } });
        if (!image) {
            throw ApiError.NotFound('Изображение отсутствует');
        }
        await staticManagement.staticDelete(image.imageSrc);
        return await HomeSlider.destroy({ where: { id } });
    }
}
module.exports = new HomeSliderService();