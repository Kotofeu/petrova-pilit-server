const settingService = require('../service/SettingService');
const ApiError = require('../error/ApiError');

class SettingController {

    async getSettings(req, res, next) {
        try {
            const settings = await settingService.getSettings();
            return res.json(settings);
        } catch (e) {
            next(e);
        }
    }

    async changeSetting(req, res, next) {
        try {
            const { key } = req.params;
            let file;
            if (req.files && req.files.file) {
                file = req.files.file
            }
            const { value } = req.body;
            const setting = await settingService.changeSetting(key, value, file);
            return res.json(setting);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new SettingController();