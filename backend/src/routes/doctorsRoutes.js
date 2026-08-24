const express = require('express');
const router = express.Router();
const doctorsController = require('../controllers/doctorsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public/Patient route to search doctors
router.get('/search', doctorsController.search);

// Doctor profile for logged in user (Protected)
router.get('/me', authenticateToken, requireRole('DOCTOR'), doctorsController.getMe);
router.put('/me', authenticateToken, requireRole('DOCTOR'), doctorsController.updateMe);

// View specific doctor profile
router.get('/:id', doctorsController.getById);

router.get('/:id/availability', doctorsController.getAvailability);
router.get('/:id/slots', doctorsController.getSlots);
router.get('/:id/patients', authenticateToken, requireRole('ADMIN', 'DOCTOR'), doctorsController.getDoctorPatients);

const multer = require('multer');
const path = require('path');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Admin only routes
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/', doctorsController.getAll);
router.post('/', upload.single('profileImage'), doctorsController.create);
router.put('/:id', upload.single('profileImage'), doctorsController.update);
router.patch('/:id/status', doctorsController.updateStatus);
router.delete('/:id', doctorsController.delete);

module.exports = router;