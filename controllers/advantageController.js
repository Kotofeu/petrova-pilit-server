const advantagesService = require('../service/AdvantagesService');
const AdvantageDto = require('../dtos/AdvantageDto');

class AdvantageController {

    async getAdvantages(req, res, next) {
        try {
            const advantages = await advantagesService.getAdvantages();
            return res.json(advantages);
        } catch (e) {
            next(e);
        }
    }

    async addAdvantage(req, res, next) {
        try {
            let image;
            let icon;
            if (req.files && req.files.image) {
                image = req.files.image
            }
            if (req.files && req.files.icon) {
                icon = req.files.icon
            }
            const advantageDto = new AdvantageDto(req.body);
            const advantage = await advantagesService.addAdvantage(advantageDto, icon, image);
            return res.json(advantage);
        } catch (e) {
            next(e);
        }
    }
    async changeById(req, res, next) {
        try {
            const { id } = req.params
            let image;
            let icon;
            if (req.files && req.files.image) {
                image = req.files.image
            }
            if (req.files && req.files.icon) {
                icon = req.files.icon
            }
            const advantageDto = new AdvantageDto(req.body);
            const advantage = await advantagesService.changeById(id, advantageDto, icon, image);
            return res.json(advantage);
        } catch (e) {
            next(e);
        }
    }
    async deleteById(req, res, next) {
        try {
            const { id } = req.params
            const advantage = await advantagesService.deleteById(id);
            return res.json(advantage);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new AdvantageController();