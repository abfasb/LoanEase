const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const loanController = require("../controllers/loanController");

// Middleware to check if the user is authenticated as a member
const isAuthenticatedMember = (req, res, next) => {
    if (!req.session || !req.session.user || req.session.user.role !== 'member') {
        return res.redirect('/login');
    }
    next();
};

// Dashboard Routes
router.get('/dashboard', isAuthenticatedMember, memberController.getDashboard);
router.get('/dashboard-data', isAuthenticatedMember, async (req, res) => {
    try {
        const data = await memberController.getDashboardData(req.session.user.cb_number);
        res.json(data);
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// Change Password Routes
router.get('/change-password', isAuthenticatedMember, memberController.renderChangePasswordPage);
router.post('/change-password', isAuthenticatedMember, memberController.updatePassword);

// Route for profile page
router.get('/profile', isAuthenticatedMember, memberController.getProfile);

// Loan Application Route
router.get('/loan-application', isAuthenticatedMember, (req, res) => {
    res.render('member/loan-application'); // Render the loan-application.ejs file inside the member folder
});

// Regular Loan Application Route
router.get('/loan-regular', isAuthenticatedMember, (req, res) => {
    res.render('member/loan-regular'); // Render the loan-regular.ejs file
});
router.post('/loan-regular', isAuthenticatedMember, loanController.submitRegularLoan);

// Salary Loan Application Route
router.get('/loan-salary', isAuthenticatedMember, (req, res) => {
    res.render('member/loan-salary'); // Render the loan-salary.ejs file
});

// Bonuses Loan Application Route
router.get('/loan-bonuses', isAuthenticatedMember, (req, res) => {
    res.render('member/loan-bonuses'); // Render the loan-bonuses.ejs file
});

// Loan Status Route
router.get('/loan-status', isAuthenticatedMember, loanController.getLoanStatus);

// Payment Method Route
router.get('/payment-method', isAuthenticatedMember, (req, res) => {
    res.render('member/payment-method', {
        loanId: req.query.loanId || '',
        loanType: req.query.loanType || '',
        amountDue: req.query.amountDue || '0.00',
        nextPaymentIndex: req.query.nextPaymentIndex || '0',
        cbNumber: req.session.user.cb_number || ''
    });
});

// Financial Forecast Route
router.get('/financial-forecast', isAuthenticatedMember, memberController.getFinancialForecast);

// Add this route for savings breakdown
router.get('/savings-breakdown', memberController.getSavingsBreakdown);

module.exports = router;