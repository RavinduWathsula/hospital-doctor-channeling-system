const pool = require('../config/database');
exports.getAll = async () => {
    const [rows] = await pool.query('SELECT id, first_name, last_name, email, role, phone, is_active, created_at FROM users');
    return rows;
};
exports.updateStatus = async (id, isActive) => {
    await pool.query('UPDATE users SET is_active=? WHERE id=?', [isActive, id]);
};