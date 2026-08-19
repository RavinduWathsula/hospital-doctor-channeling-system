const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    
    // Default error message
    let message = err.message || 'Server Error';
    let errors = err.errors || [];

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };
