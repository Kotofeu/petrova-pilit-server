require('dotenv').config();
const { WorkSchedule } = require('../models/models');
const initWorkSchedule = async () => {
    try {
        const daysOfWeek = [
            { name: 'Понедельник', shortName: 'Пн.' },
            { name: 'Вторник', shortName: 'Вт.' },
            { name: 'Среда', shortName: 'Ср.' },
            { name: 'Четверг', shortName: 'Чт.' },
            { name: 'Пятница', shortName: 'Пт.' },
            { name: 'Суббота', shortName: 'Сб.' },
            { name: 'Воскресенье', shortName: 'Вс.' },
        ];
        const count = await WorkSchedule.count()
        if (count !== daysOfWeek.length) {
            await WorkSchedule.destroy({
                where: {},
                truncate: true,
            });

            const result = await WorkSchedule.bulkCreate(daysOfWeek);
            console.log('Таблица графика работы заполнена!');
        }

    }
    catch {
        console.error(`Невозможно создать график работы`);

    }
};

initWorkSchedule();