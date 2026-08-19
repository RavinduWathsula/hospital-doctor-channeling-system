const pool = require('../config/database');
exports.getAll = async () => {
    const [rows] = await pool.query('SELECT * FROM departments');
    return rows;
};
exports.create = async (name, description) => {
    const [res] = await pool.query('INSERT INTO departments (name, description) VALUES (?, ?)', [name, description]);
    return res.insertId;
};
exports.update = async (id, name, description, isActive) => {
    await pool.query('UPDATE departments SET name=?, description=?, is_active=? WHERE id=?', [name, description, isActive, id]);
};
exports.delete = async (id) => {
    await pool.query('DELETE FROM departments WHERE id=?', [id]);
};