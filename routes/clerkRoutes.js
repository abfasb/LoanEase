const express = require('express');
const router = express.Router();
const clerkController = require('../controllers/clerkController');
const { isAuthenticated, isClerk } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Dashboard routes
router.get('/dashboard', isAuthenticated, isClerk, clerkController.showDashboard);
router.get('/dashboard-data', isAuthenticated, isClerk, clerkController.getDashboardData);
router.get('/recent-members', isAuthenticated, isClerk, clerkController.getRecentMembers);

// Registration routes
router.get('/register', isAuthenticated, isClerk, clerkController.showRegisterForm);
router.post('/register', isAuthenticated, isClerk, upload.single('profile_picture'), clerkController.registerMember);

// Members management routes
router.get('/members', isAuthenticated, isClerk, clerkController.viewMembers);
router.get('/members-list', isAuthenticated, isClerk, clerkController.viewMembers);
router.get('/members/:cbNumber', isAuthenticated, isClerk, clerkController.viewMemberDetails);

// Member CRUD operations (same as admin)
router.put('/update-member', isAuthenticated, isClerk, clerkController.updateMember);
router.put('/archive-member/:cbNumber', isAuthenticated, isClerk, clerkController.archiveMember);
router.put('/restore-member/:cbNumber', isAuthenticated, isClerk, clerkController.restoreMember);
router.get('/archived-members', isAuthenticated, isClerk, clerkController.getArchivedMembers);

module.exports = router;