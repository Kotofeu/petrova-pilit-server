const workTypesService = require('../service/WorkTypesService');

class WorkTypeController {

    async getWorkTypes(req, res, next) {
        try {
            const workTypes = await workTypesService.getWorkTypes();
            return res.json(workTypes);
        } catch (e) {
            next(e);
        }
    }

    async addWorkType(req, res, next) {
        try {
            const { name } = req.body
            const workType = await workTypesService.addWorkType(name);
            return res.json(workType);
        } catch (e) {
            next(e);
        }
    }
    async changeById(req, res, next) {
        try {
            const { id } = req.params
            const { name } = req.body
            const workType = await workTypesService.changeById(id, name);
            return res.json(workType);
        } catch (e) {
            next(e);
        }
    }
    async deleteById(req, res, next) {
        try {
            const { id } = req.params
            const workType = await workTypesService.deleteById(id);
            return res.json(workType);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new WorkTypeController();