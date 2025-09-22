const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
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

const isAuthenticatedAdmin = (req, res, next) => {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
};

router.get('/dashboard', isAuthenticatedAdmin, adminController.renderDashboard);
router.get('/dashboard-data', isAuthenticatedAdmin, adminController.getDashboardData);

router.get('/register', isAuthenticatedAdmin, adminController.renderRegisterPage);
router.post('/register', isAuthenticatedAdmin, upload.single('profile_picture'), adminController.registerMember);

router.get('/change-password', isAuthenticatedAdmin, adminController.renderChangePasswordPage);
router.post('/change-password', isAuthenticatedAdmin, adminController.updatePassword);

router.get("/members-list", isAuthenticatedAdmin, adminController.renderMembersList);
router.put('/update-member', isAuthenticatedAdmin, adminController.updateMember);
router.put('/archive-member/:cbNumber', isAuthenticatedAdmin, adminController.archiveMember);
router.put('/restore-member/:cbNumber', isAuthenticatedAdmin, adminController.restoreMember);
router.get('/archived-members', isAuthenticatedAdmin, adminController.getArchivedMembers);

router.get('/loan-regular', isAuthenticatedAdmin, adminController.renderRegularLoanForm);
router.get('/loan-salary_bonuses', isAuthenticatedAdmin, adminController.renderLoanSalaryBonuses);

router.get('/regular_agricultural_loans', isAuthenticatedAdmin, adminController.getRegularLoans);
router.get('/salary_bonuses_loans', isAuthenticatedAdmin, adminController.getSalaryBonusesLoans);

router.post('/submit-salary-bonus-loan', isAuthenticatedAdmin, adminController.submitSalaryBonusLoan);
router.post('/save-regular-agricultural-loan', isAuthenticatedAdmin, adminController.saveRegularAgriculturalLoan);

router.get('/loan-releases', isAuthenticatedAdmin, adminController.getLoanReleases);

module.exports = router;