const pool = require('../config/database');

exports.getMyNotifications = async (userId) => {
    const [rows] = await pool.query(`
        SELECT id, title, message, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `, [userId]);
    return rows;
};

exports.markAsRead = async (id, userId) => {
    const [result] = await pool.query(`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ? AND user_id = ?
    `, [id, userId]);
    return result.affectedRows > 0;
};

// Helper to create notifications internally
exports.createNotification = async (userId, title, message) => {
    await pool.query(`
        INSERT INTO notifications (user_id, title, message)
        VALUES (?, ?, ?)
    `, [userId, title, message]);
};
