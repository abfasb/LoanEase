const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { isAdmin } = require('../middlewares/authMiddleware');

router.get('/', isAdmin, reportController.getReportsPage);
router.post('/generate', isAdmin, reportController.generateReports);
router.get('/summary', isAdmin, reportController.getLoanSummary);
router.get('/export', isAdmin, reportController.exportReports);

module.exports = router;