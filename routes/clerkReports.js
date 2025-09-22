const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Clerk report routes
router.get('/', reportController.getClerkReportsPage);
router.post('/generate', reportController.generateMemberReports);
router.get('/export', reportController.exportMemberReports);
router.get('/statistics', reportController.getMemberStatistics);

module.exports = router;