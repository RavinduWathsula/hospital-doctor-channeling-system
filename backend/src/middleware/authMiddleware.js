const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    }

    if (!token) {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        console.log(`[AUTH] Route: ${req.originalUrl}, Required roles:`, roles, `User role:`, req.user ? req.user.role : 'none');
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            return next(new Error(`User role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route. Expected one of: ${roles.join(', ')}`));
        }
        next();
    };
};

module.exports = { authenticateToken, requireRole };
