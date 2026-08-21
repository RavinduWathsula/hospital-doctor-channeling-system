const pool = require('../config/database');
const twilio = require('twilio');

// Initialize Twilio client if credentials are provided
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'your_account_sid_here' && process.env.TWILIO_AUTH_TOKEN) {
    try {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (err) {
        console.error('Failed to initialize Twilio client:', err.message);
    }
}

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

// Helper to create notifications internally and send SMS
exports.createNotification = async (userId, title, message) => {
    // 1. Database In-App Notification
    await pool.query(`
        INSERT INTO notifications (user_id, title, message)
        VALUES (?, ?, ?)
    `, [userId, title, message]);

    // 2. SMS Integration via Twilio
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER !== 'your_twilio_phone_number_here') {
        try {
            // Fetch the user's phone number from the DB
            const [users] = await pool.query('SELECT phone, first_name FROM users WHERE id = ?', [userId]);
            if (users.length > 0) {
                const userPhone = users[0].phone;
                
                // Only send if phone number exists and has a reasonable length (very basic validation)
                if (userPhone && userPhone.length >= 10 && userPhone !== '0000000000') {
                    // Ensure the number is formatted with a country code (assuming +94 for Sri Lanka or similar if missing)
                    // If it doesn't start with +, you might need to prepend a default country code
                    let formattedPhone = userPhone;
                    if (!formattedPhone.startsWith('+')) {
                        // Defaulting to +94 (Sri Lanka) if no plus is provided based on the user's name style, 
                        // but ideally should be formatted on the frontend or dynamically.
                        // We will just prepend '+' if they entered '9477...'. 
                        // If they entered '077...', Twilio might fail without country code, so we format it simply:
                        if (formattedPhone.startsWith('0')) {
                            formattedPhone = '+94' + formattedPhone.substring(1); // Default to LK for this demo
                        } else if (!formattedPhone.startsWith('+')) {
                            formattedPhone = '+' + formattedPhone;
                        }
                    }

                    await twilioClient.messages.create({
                        body: `Smart Hospital - ${title}: ${message}`,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: formattedPhone
                    });
                    
                    console.log(`[SMS SUCCESS] Sent SMS to ${formattedPhone} for User ID ${userId}`);
                } else {
                    console.log(`[SMS SKIPPED] Invalid or empty phone number for User ID ${userId}`);
                }
            }
        } catch (error) {
            console.error(`[SMS ERROR] Failed to send SMS to User ID ${userId}:`, error.message);
        }
    } else {
        console.log(`[SMS SKIPPED] Twilio is not fully configured in .env (User ID ${userId})`);
    }
};
