exports.updateAppointmentStatusAdmin = async (id, status) => {
    const [result] = await pool.query(`
        UPDATE appointments
        SET status = ?
        WHERE id = ?
    `, [status, id]);
    
    return result.affectedRows > 0;
};
