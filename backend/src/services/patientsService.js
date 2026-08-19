const pool = require('../config/database');
exports.getAll = async () => {
    const [rows] = await pool.query(`
        SELECT p.*, u.first_name, u.last_name, u.email, u.phone, u.nic, u.is_active 
        FROM patients p
        JOIN users u ON p.user_id = u.id
    `);
    return rows;
};
exports.updateStatus = async (userId, isActive) => {
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
};