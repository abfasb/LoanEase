const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');

// Payment method routes
router.post('/payment/gcash', paymentController.processGcashPayment);
router.post('/payment/atm', paymentController.processATMPayment);
router.post('/payment/otc', paymentController.processOTCPayment);

// Payment status routes
router.get('/payment/status/:loanId/:loanType', paymentController.getPaymentStatus);
router.post('/payment/update-status', paymentController.updatePaymentStatus);
router.get('/payment/next-due/:loanId/:loanType', paymentController.getNextPaymentDue);

module.exports = router;