// routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// View announcements (accessible to admins, cashiers, clerks, members)
router.get('/', isAuthenticated, announcementController.getAnnouncements);

// Create announcement (accessible to all authenticated users)
router.post('/', isAuthenticated, announcementController.createAnnouncement);

module.exports = router;