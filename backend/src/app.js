const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/patients', require('./routes/patientsRoutes'));
app.use('/api/doctors', require('./routes/doctorsRoutes'));
app.use('/api/departments', require('./routes/departmentsRoutes'));
app.use('/api/schedules', require('./routes/schedulesRoutes'));
app.use('/api/appointments', require('./routes/appointmentsRoutes'));
app.use('/api/slots', require('./routes/slotsRoutes'));
app.use('/api/queues', require('./routes/queuesRoutes'));
app.use('/api/notifications', require('./routes/notificationsRoutes'));
app.use('/api/reports', require('./routes/reportsRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Default Route
app.get('/', (req, res) => {
    res.json({ message: 'Smart Hospital API is running...' });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404);
    next(new Error(`Not Found - ${req.originalUrl}`));
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
