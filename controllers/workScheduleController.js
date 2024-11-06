const workScheduleService = require('../service/WorkScheduleService');

class WorkScheduleController {

    async getWorkSchedule(req, res, next) {
        try {
            const workSchedule = await workScheduleService.getWorkSchedule();
            return res.json(workSchedule);
        } catch (e) {
            next(e);
        }
    }

    async changeWorkSchedule(req, res, next) {
        try {
            const { id } = req.params;
            const { value } = req.body;
            const workSchedule = await workScheduleService.changeWorkSchedule(id, value);
            return res.json(workSchedule);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new WorkScheduleController();