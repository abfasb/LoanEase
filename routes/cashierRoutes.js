const express = require('express');
const router = express.Router();
const cashierController = require('../controllers/cashierController');
const { isCashier } = require('../middlewares/authMiddleware');

// Apply cashier middleware to all routes
router.use(isCashier);

// Dashboard Route
router.get('/dashboard', cashierController.getDashboard);

// Active Loans Route
router.get('/active-loans', cashierController.getActiveLoans);

// Loan Details API
router.get('/api/loans/:loanId', cashierController.getLoanDetails);

// Loan Payments Route
router.get('/loan-payments', cashierController.getLoanPayments);

// API Endpoints for Loan Payments
router.get('/get-payments', cashierController.getPayments);
router.post('/approve-payment', cashierController.approvePayment);
router.post('/reject-payment', cashierController.rejectPayment);

// API Endpoint for Member Payments
router.get('/payments/:cb_number', cashierController.getPaymentsByMember);

// Payment Collections Routes
router.get('/payment-collections', cashierController.getPaymentCollections);
router.post('/payment-collections', cashierController.postPaymentCollections);

// Reports Routes
router.get('/reports', cashierController.getReports);
router.get('/reports/generate', cashierController.generateReport);
router.get('/report-details/:type/:id', cashierController.getReportDetails);

// Logout Routes
router.get('/logout', cashierController.getLogout);
router.post('/logout', cashierController.postLogout);

module.exports = router;