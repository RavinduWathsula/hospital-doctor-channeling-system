const departmentsService = require('../services/departmentsService');
exports.getAll = async (req, res, next) => {
    try {
        const data = await departmentsService.getAll();
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};
exports.create = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        await departmentsService.create(name, description);
        res.status(201).json({ success: true, message: 'Department created' });
    } catch (error) { next(error); }
};
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;
        await departmentsService.update(id, name, description, isActive);
        res.status(200).json({ success: true, message: 'Department updated' });
    } catch (error) { next(error); }
};
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;
        await departmentsService.delete(id);
        res.status(200).json({ success: true, message: 'Department deleted' });
    } catch (error) { 
        if(error.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(409);
            next(new Error('Cannot delete department because doctors are assigned to it. Deactivate it instead.'));
        } else { next(error); }
    }
};