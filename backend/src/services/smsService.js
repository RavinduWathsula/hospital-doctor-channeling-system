const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken && accountSid.startsWith('AC')) {
    client = twilio(accountSid, authToken);
}

/**
 * Sends an SMS message using Twilio or logs it if Twilio is not configured.
 * @param {string} to - The recipient's phone number.
 * @param {string} message - The message content.
 */
const sendSMS = async (to, message) => {
    // Basic phone number formatting check (ensure it starts with a '+')
    // Note: Twilio requires E.164 format (e.g., +1234567890)
    let formattedTo = to.trim();
    if (!formattedTo.startsWith('+')) {
        // Assuming a default country code if missing. Update this as needed.
        formattedTo = '+' + formattedTo; 
    }

    if (client && twilioNumber) {
        try {
            const response = await client.messages.create({
                body: message,
                from: twilioNumber,
                to: formattedTo
            });
            console.log(`SMS successfully sent to ${formattedTo}. SID: ${response.sid}`);
            return true;
        } catch (error) {
            console.error(`Failed to send SMS to ${formattedTo}:`, error.message);
            // Don't throw the error so that the main application flow is not interrupted
            return false;
        }
    } else {
        // Fallback for development if Twilio credentials are not set
        console.log('======================================================');
        console.log('📱 MOCK SMS TRIGGERED (Twilio not configured in .env)');
        console.log(`To: ${formattedTo}`);
        console.log(`Message: \n${message}`);
        console.log('======================================================');
        return true;
    }
};

/**
 * Sends a welcome message upon patient registration.
 */
const sendWelcomeSMS = async (phone, firstName) => {
    const message = `Hello ${firstName}, welcome to SmartHospital! Your registration is complete. You can now book appointments and view your medical history online.`;
    return await sendSMS(phone, message);
};

/**
 * Sends an appointment booking confirmation (acting also as a payment receipt).
 */
const sendBookingConfirmationSMS = async (phone, patientName, doctorName, date, time, queueNumber) => {
    const message = `Hello ${patientName}, your payment is received and appointment with ${doctorName} is confirmed! Date: ${date}, Time: ${time}. Your Queue Number is #${queueNumber}. Thank you for choosing SmartHospital.`;
    return await sendSMS(phone, message);
};

/**
 * Sends a pure payment receipt (Optional, if separate from booking).
 */
const sendPaymentReceiptSMS = async (phone, patientName, amount) => {
    const message = `Hello ${patientName}, we have successfully received your payment of ${amount}. Thank you, SmartHospital.`;
    return await sendSMS(phone, message);
};

module.exports = {
    sendSMS,
    sendWelcomeSMS,
    sendBookingConfirmationSMS,
    sendPaymentReceiptSMS
};
