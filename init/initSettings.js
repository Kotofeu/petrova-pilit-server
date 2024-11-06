require('dotenv').config();
const { MainSettings } = require('../models/models');

const initSettings = async () => {
    try {
        const settings = [
            'promoBanner', 'addressMap', 'aboutMe', 'howToGetPreview', 'howToGetVideo'
        ]
        settings.map(async key => {
            const setting = await MainSettings.findOne({ where: { key } })
            if (!setting) {
                await MainSettings.create({ key })
            }
        })
    }
    catch {
        console.error(`Невозможно создать базовые настройки`);
    }
};

initSettings();