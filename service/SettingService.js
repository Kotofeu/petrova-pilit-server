const { MainSettings } = require('../models/models');
const ApiError = require('../error/ApiError');
const staticManagement = require('../helpers/staticManagement')
class OfficeService {

    async getSettings() {
        const settings = await MainSettings.findAll();
        const settingsObj = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        return settingsObj;
    }
    async changeSetting(key, value, file) {
        const setting = await MainSettings.findOne({ where: { key } });
        if (!setting) {
            throw ApiError.NotFound(`Настройка ${key} не найдена`);
        }
        await staticManagement.staticDelete(setting.value);

        if (!value && !file){
            setting.value = null
        }
        if (file) {
            const fileName = await staticManagement.staticCreate(file);
            setting.value = fileName
        }
        else{
            setting.value = value
        }
        await setting.save()
        return setting
    }
}
module.exports = new OfficeService();