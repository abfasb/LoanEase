const Payment = require('../models/LoanPayment');
const { generateReferenceNumber } = require('../utils/helpers');

// Add a simple in-memory cache to prevent duplicate submissions
const recentSubmissions = new Map();

// Helper function to check for duplicate submissions
const isDuplicateSubmission = (key) => {
    const now = Date.now();
    const lastSubmission = recentSubmissions.get(key);
    
    // If submitted within last 5 seconds, consider it duplicate
    if (lastSubmission && (now - lastSubmission) < 5000) {
        return true;
    }
    
    // Store current submission time
    recentSubmissions.set(key, now);
    
    // Clean up old entries (older than 1 minute)
    for (const [k, v] of recentSubmissions.entries()) {
        if (now - v > 60000) {
            recentSubmissions.delete(k);
        }
    }
    
    return false;
};

// Process GCash Payment
exports.processGcashPayment = async (req, res) => {
    try {
        const { cbNumber, loanId, loanType, gcashAmount, gcashPaymentType, 
                gcashReference, gcashFullName, nextPaymentIndex } = req.body;

        // Create unique key for this submission
        const submissionKey = `${cbNumber}-${loanId}-${gcashAmount}-${Date.now().toString().slice(-6)}`;
        
        // Check for duplicate submission
        if (isDuplicateSubmission(submissionKey)) {
            return res.status(429).json({
                success: false,
                message: 'Duplicate submission detected. Please wait before trying again.'
            });
        }

        // Validate required fields
        if (!cbNumber || !loanId || !loanType || !gcashAmount || !gcashPaymentType) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Get the next payment sequence
        Payment.getNextPaymentSequence(loanId, loanType, (err, paymentSequence) => {
            if (err) {
                console.error('Error getting payment sequence:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error processing payment'
                });
            }

            // Map loan type to match database enum
            const loanTypeMap = {
                'agricultural': 'Regular/Agricultural',
                'regular/agricultural': 'Regular/Agricultural',
                'salary': 'Salary',
                'bonuses': 'Bonuses'
            };
            const mappedLoanType = loanTypeMap[loanType.toLowerCase()] || loanType;

            const paymentData = {
                cb_number: cbNumber,
                loan_id: loanId,
                loan_type: mappedLoanType,
                payment_method: 'GCash',
                amount_paid: parseFloat(gcashAmount),
                payment_type: gcashPaymentType === 'full' ? 'Full Payment' : 'Partial Payment',
                reference_number: generateReferenceNumber('GC'),
                gcash_reference: gcashReference,
                gcash_fullname: gcashFullName,
                payment_sequence: paymentSequence,
                status: 'Pending'
            };

            Payment.create(paymentData, (err, payment) => {
                if (err) {
                    console.error('GCash payment error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error processing GCash payment',
                        error: err.message
                    });
                }
                
                res.json({
                    success: true,
                    message: 'GCash payment submitted successfully',
                    referenceNumber: payment.reference_number,
                    paymentId: payment.payment_id,
                    paymentSequence: payment.payment_sequence
                });
            });
        });
    } catch (error) {
        console.error('Error in processGcashPayment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Process ATM Payment
exports.processATMPayment = async (req, res) => {
    try {
        const { cbNumber, loanId, loanType, atmAmount, atmPaymentType, 
                atmCardNumber, atmBank, atmFullName, nextPaymentIndex } = req.body;

        // Create unique key for this submission
        const submissionKey = `${cbNumber}-${loanId}-${atmAmount}-ATM-${Date.now().toString().slice(-6)}`;
        
        // Check for duplicate submission
        if (isDuplicateSubmission(submissionKey)) {
            return res.status(429).json({
                success: false,
                message: 'Duplicate submission detected. Please wait before trying again.'
            });
        }

        // Validate required fields
        if (!cbNumber || !loanId || !loanType || !atmAmount || !atmPaymentType) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Get the next payment sequence
        Payment.getNextPaymentSequence(loanId, loanType, (err, paymentSequence) => {
            if (err) {
                console.error('Error getting payment sequence:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error processing payment'
                });
            }

            // Map loan type to match database enum
            const loanTypeMap = {
                'agricultural': 'Regular/Agricultural',
                'regular/agricultural': 'Regular/Agricultural',
                'salary': 'Salary',
                'bonuses': 'Bonuses'
            };
            const mappedLoanType = loanTypeMap[loanType.toLowerCase()] || loanType;

            const paymentData = {
                cb_number: cbNumber,
                loan_id: loanId,
                loan_type: mappedLoanType,
                payment_method: 'ATM',
                amount_paid: parseFloat(atmAmount),
                payment_type: atmPaymentType === 'full' ? 'Full Payment' : 'Partial Payment',
                reference_number: generateReferenceNumber('ATM'),
                atm_card_last4: atmCardNumber,
                atm_bank: atmBank,
                atm_fullname: atmFullName,
                next_deduction_date: new Date(new Date().setDate(new Date().getDate() + 7)),
                payment_sequence: paymentSequence,
                status: 'Pending'
            };

            Payment.create(paymentData, (err, payment) => {
                if (err) {
                    console.error('ATM payment error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error processing ATM payment',
                        error: err.message
                    });
                }
                
                res.json({
                    success: true,
                    message: 'ATM payment authorization submitted successfully',
                    referenceNumber: payment.reference_number,
                    paymentId: payment.payment_id,
                    paymentSequence: payment.payment_sequence
                });
            });
        });
    } catch (error) {
        console.error('Error in processATMPayment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Process Over the Counter Payment
exports.processOTCPayment = async (req, res) => {
    try {
        const { cbNumber, loanId, loanType, otcAmount, otcPaymentType, 
                otcFullName, otcPaymentDate, otcPaymentTime, 
                otcPaymentMethod, otcCheckNumber, nextPaymentIndex } = req.body;

        // Create unique key for this submission
        const submissionKey = `${cbNumber}-${loanId}-${otcAmount}-OTC-${Date.now().toString().slice(-6)}`;
        
        // Check for duplicate submission
        if (isDuplicateSubmission(submissionKey)) {
            return res.status(429).json({
                success: false,
                message: 'Duplicate submission detected. Please wait before trying again.'
            });
        }

        // Validate required fields
        if (!cbNumber || !loanId || !loanType || !otcAmount || !otcPaymentType) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Get the next payment sequence
        Payment.getNextPaymentSequence(loanId, loanType, (err, paymentSequence) => {
            if (err) {
                console.error('Error getting payment sequence:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error processing payment'
                });
            }

            // Map loan type to match database enum
            const loanTypeMap = {
                'agricultural': 'Regular/Agricultural',
                'regular/agricultural': 'Regular/Agricultural',
                'salary': 'Salary',
                'bonuses': 'Bonuses'
            };
            const mappedLoanType = loanTypeMap[loanType.toLowerCase()] || loanType;

            const paymentData = {
                cb_number: cbNumber,
                loan_id: loanId,
                loan_type: mappedLoanType,
                payment_method: 'Over the Counter',
                amount_paid: parseFloat(otcAmount),
                payment_type: otcPaymentType === 'full' ? 'Full Payment' : 'Partial Payment',
                reference_number: generateReferenceNumber('OTC'),
                otc_fullname: otcFullName,
                otc_payment_date: otcPaymentDate,
                otc_payment_time: otcPaymentTime,
                otc_payment_method: otcPaymentMethod || 'Cash',
                payment_sequence: paymentSequence,
                status: 'Pending'
            };

            if (otcPaymentMethod === 'Check') {
                paymentData.otc_check_number = otcCheckNumber;
            }

            Payment.create(paymentData, (err, payment) => {
                if (err) {
                    console.error('OTC payment error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error scheduling over the counter payment',
                        error: err.message
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Over the counter payment scheduled successfully',
                    referenceNumber: payment.reference_number,
                    paymentId: payment.payment_id,
                    paymentSequence: payment.payment_sequence
                });
            });
        });
    } catch (error) {
        console.error('Error in processOTCPayment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get payment status for a specific loan
exports.getPaymentStatus = (req, res) => {
    const { loanId, loanType } = req.params;
    
    Payment.getByLoanId(loanId, loanType, (err, payments) => {
        if (err) {
            console.error('Error fetching payment status:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching payment status'
            });
        }
        
        res.json({
            success: true,
            payments: payments
        });
    });
};

// Update payment status (for admin use)
exports.updatePaymentStatus = (req, res) => {
    const { paymentId, status } = req.body;
    
    Payment.updateStatus(paymentId, status, (err, result) => {
        if (err) {
            console.error('Error updating payment status:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating payment status'
            });
        }
        
        res.json({
            success: true,
            message: 'Payment status updated successfully'
        });
    });
};

// Get next payment due for a loan
exports.getNextPaymentDue = (req, res) => {
    const { loanId, loanType } = req.params;
    
    Payment.getNextPaymentSequence(loanId, loanType, (err, nextSequence) => {
        if (err) {
            console.error('Error getting next payment due:', err);
            return res.status(500).json({
                success: false,
                message: 'Error getting next payment due'
            });
        }
        
        Payment.getLastPayment(loanId, loanType, (err, lastPayment) => {
            if (err) {
                console.error('Error getting last payment:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error getting next payment due'
                });
            }
            
            res.json({
                success: true,
                nextPaymentSequence: nextSequence,
                lastPayment: lastPayment
            });
        });
    });
};

// In your member/payment controller, update the getPaymentStatus route:
exports.getPaymentStatus = async (req, res) => {
    try {
        const { loanId, loanType } = req.params;

        console.log('📊 Fetching payment status - Loan ID:', loanId, 'Type:', loanType);

        if (!loanId || !loanType) {
            return res.status(400).json({
                success: false,
                message: 'Missing loan ID or loan type'
            });
        }

        // Use the new method with rejection reasons
        Payment.getByLoanIdWithRejections(loanId, loanType, (error, results) => {
            if (error) {
                console.error('❌ Error fetching payment status:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error while fetching payment status',
                    error: error.message
                });
            }

            console.log('✅ Payment records found:', results.length);

            // Check for failed payments
            const failedPayments = results.filter(p => p.status === 'Failed');
            const hasFailedPayment = failedPayments.length > 0;
            const firstFailedPayment = hasFailedPayment ? failedPayments[0] : null;

            res.json({
                success: true,
                payments: results,
                totalPayments: results.length,
                paidCount: results.filter(p => p.status === 'Completed').length,
                pendingCount: results.filter(p => p.status === 'Pending').length,
                failedCount: failedPayments.length,
                overdueCount: results.filter(p => p.status === 'Overdue').length,
                hasFailedPayment: hasFailedPayment,
                firstFailedPayment: firstFailedPayment
            });
        });
    } catch (error) {
        console.error('❌ Error in getPaymentStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
