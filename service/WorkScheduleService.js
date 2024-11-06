const { WorkSchedule } = require('../models/models');
const ApiError = require('../error/ApiError');

class WorkScheduleService {

    async getWorkSchedule() {
        const workSchedule = await WorkSchedule.findAll();
        return workSchedule;
    }
    async changeWorkSchedule(id, value) {
        const workSchedule = await WorkSchedule.findOne({ where: { id } });
        if (!workSchedule) {
            throw ApiError.NotFound(`День недели с ${id} не существует`);
        }

        if (!value){
            workSchedule.value = '00:00 - 00:00'
        }
        else{
            workSchedule.value = value
        }
        await workSchedule.save()
        return workSchedule
    }
}
module.exports = new WorkScheduleService();