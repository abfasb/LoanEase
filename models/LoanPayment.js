const db = require('../config/db');

class Payment {
    static create(paymentData, callback) {
        // Validate required fields
        if (!paymentData.cb_number || !paymentData.loan_id || !paymentData.loan_type || 
            !paymentData.payment_method || !paymentData.amount_paid || !paymentData.reference_number) {
            return callback(new Error('Missing required fields'));
        }

        // Map loan type to match database enum
        const loanTypeMap = {
            'agricultural': 'Regular/Agricultural',
            'regular/agricultural': 'Regular/Agricultural',
            'salary': 'Salary',
            'bonuses': 'Bonuses'
        };
        const mappedLoanType = loanTypeMap[paymentData.loan_type.toLowerCase()] || paymentData.loan_type;

        // Validate enum fields
        const validLoanTypes = ['Regular/Agricultural', 'Salary', 'Bonuses'];
        const validPaymentMethods = ['GCash', 'ATM', 'Over the Counter'];
        const validPaymentTypes = ['Full Payment', 'Partial Payment'];
        const validOtcPaymentMethods = ['Cash', 'Check'];
        const validStatuses = ['Pending', 'Completed', 'Failed'];

        if (!validLoanTypes.includes(mappedLoanType)) {
            return callback(new Error(`Invalid loan type: ${paymentData.loan_type}`));
        }
        if (!validPaymentMethods.includes(paymentData.payment_method)) {
            return callback(new Error('Invalid payment method'));
        }
        if (!validPaymentTypes.includes(paymentData.payment_type)) {
            return callback(new Error('Invalid payment type'));
        }
        if (paymentData.payment_method === 'Over the Counter' && paymentData.otc_payment_method && !validOtcPaymentMethods.includes(paymentData.otc_payment_method)) {
            return callback(new Error('Invalid OTC payment method'));
        }
        if (!validStatuses.includes(paymentData.status)) {
            return callback(new Error('Invalid status'));
        }

        // Prepare the data for insertion
        const insertData = {
            cb_number: paymentData.cb_number,
            loan_id: paymentData.loan_id,
            loan_type: mappedLoanType,
            payment_method: paymentData.payment_method,
            amount_paid: parseFloat(paymentData.amount_paid),
            payment_type: paymentData.payment_type,
            reference_number: paymentData.reference_number,
            status: paymentData.status || 'Pending',
            payment_date: new Date(),
            payment_sequence: paymentData.payment_sequence || 1
        };

        // Add method-specific fields
        if (paymentData.payment_method === 'GCash') {
            insertData.gcash_reference = paymentData.gcash_reference || null;
            insertData.gcash_fullname = paymentData.gcash_fullname || null;
            if (paymentData.gcash_receipt_path) {
                insertData.gcash_receipt_path = paymentData.gcash_receipt_path;
            }
        } else if (paymentData.payment_method === 'ATM') {
            insertData.atm_card_last4 = paymentData.atm_card_last4 || null;
            insertData.atm_bank = paymentData.atm_bank || null;
            insertData.atm_fullname = paymentData.atm_fullname || null;
            insertData.next_deduction_date = paymentData.next_deduction_date || new Date(new Date().setDate(new Date().getDate() + 7));
        } else if (paymentData.payment_method === 'Over the Counter') {
            insertData.otc_fullname = paymentData.otc_fullname || null;
            insertData.otc_payment_date = paymentData.otc_payment_date || null;
            insertData.otc_payment_time = paymentData.otc_payment_time || null;
            insertData.otc_payment_method = paymentData.otc_payment_method || 'Cash';
            if (paymentData.otc_payment_method === 'Check') {
                insertData.otc_check_number = paymentData.otc_check_number || null;
            }
        }

        const query = 'INSERT INTO loan_payments SET ?';
        db.query(query, insertData, (err, result) => {
            if (err) return callback(err);
            
            const paymentId = result.insertId;
            const findQuery = 'SELECT * FROM loan_payments WHERE payment_id = ?';
            db.query(findQuery, [paymentId], (err, rows) => {
                if (err) return callback(err);
                callback(null, rows[0]);
            });
        });
    }

    static getAll(callback) {
        const query = `
            SELECT 
                lp.payment_id,
                lp.cb_number,
                lp.loan_id,
                lp.loan_type,
                lp.payment_method,
                lp.amount_paid,
                lp.payment_type,
                lp.reference_number,
                lp.payment_sequence,
                lp.status,
                lp.created_at,
                lp.gcash_reference,
                lp.gcash_fullname,
                lp.atm_card_last4,
                lp.atm_bank,
                lp.atm_fullname,
                lp.next_deduction_date,
                lp.otc_fullname,
                lp.otc_payment_date,
                lp.otc_payment_time,
                lp.otc_payment_method,
                lp.otc_check_number,
                CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS member_name
            FROM loan_payments lp
            LEFT JOIN members m ON lp.cb_number = m.cb_number
            ORDER BY lp.created_at DESC
        `;
        db.query(query, callback);
    }

    static getByLoanId(loanId, loanType, callback) {
        const loanTypeMap = {
            'agricultural': 'Regular/Agricultural',
            'regular/agricultural': 'Regular/Agricultural',
            'salary': 'Salary',
            'bonuses': 'Bonuses'
        };
        const mappedLoanType = loanTypeMap[loanType.toLowerCase()] || loanType;
        
        const query = `
            SELECT * FROM loan_payments 
            WHERE loan_id = ? AND loan_type = ? 
            ORDER BY payment_sequence ASC, created_at ASC
        `;
        db.query(query, [loanId, mappedLoanType], callback);
    }

    static updateStatus(paymentId, status, callback) {
        const query = 'UPDATE loan_payments SET status = ?, updated_at = NOW() WHERE payment_id = ?';
        db.query(query, [status, paymentId], callback);
    }

    static getPaymentsByStatus(status, callback) {
        const query = 'SELECT * FROM loan_payments WHERE status = ? ORDER BY created_at DESC';
        db.query(query, [status], callback);
    }

    static getNextPaymentSequence(loanId, loanType, callback) {
        const loanTypeMap = {
            'agricultural': 'Regular/Agricultural',
            'regular/agricultural': 'Regular/Agricultural',
            'salary': 'Salary',
            'bonuses': 'Bonuses'
        };
        const mappedLoanType = loanTypeMap[loanType.toLowerCase()] || loanType;
        
        const query = `
            SELECT MAX(payment_sequence) as last_sequence 
            FROM loan_payments 
            WHERE loan_id = ? AND loan_type = ?
        `;
        db.query(query, [loanId, mappedLoanType], (err, results) => {
            if (err) return callback(err);
            const nextSequence = (results[0].last_sequence || 0) + 1;
            callback(null, nextSequence);
        });
    }

    static getLastPayment(loanId, loanType, callback) {
        const loanTypeMap = {
            'agricultural': 'Regular/Agricultural',
            'regular/agricultural': 'Regular/Agricultural',
            'salary': 'Salary',
            'bonuses': 'Bonuses'
        };
        const mappedLoanType = loanTypeMap[loanType.toLowerCase()] || loanType;
        
        const query = `
            SELECT * FROM loan_payments 
            WHERE loan_id = ? AND loan_type = ? 
            ORDER BY payment_sequence DESC, created_at DESC 
            LIMIT 1
        `;
        db.query(query, [loanId, mappedLoanType], (err, results) => {
            if (err) return callback(err);
            callback(null, results.length > 0 ? results[0] : null);
        });
    }
    // Add this method to your Payment class
static getByLoanIdWithRejections(loanId, loanType, callback) {
    const loanTypeMap = {
        'agricultural': 'Regular/Agricultural',
        'regular/agricultural': 'Regular/Agricultural',
        'salary': 'Salary',
        'bonuses': 'Bonuses'
    };
    const mappedLoanType = loanTypeMap[loanType.toLowerCase()] || loanType;
    
    const query = `
        SELECT 
            lp.*,
            pr.reason as rejection_reason,
            pr.created_at as rejection_date
        FROM loan_payments lp
        LEFT JOIN payment_rejections pr ON lp.payment_id = pr.payment_id
        WHERE lp.loan_id = ? AND lp.loan_type = ? 
        ORDER BY lp.payment_sequence ASC, lp.created_at ASC
    `;
    db.query(query, [loanId, mappedLoanType], callback);
}



}

// Add this method to your adminController.js

// Get Payment Status for Admin
exports.getAdminPaymentStatus = async (req, res) => {
    try {
        const { loanId, loanType } = req.params;

        console.log('📊 Fetching payment status for Admin - Loan ID:', loanId, 'Type:', loanType);

        // Validate parameters
        if (!loanId || !loanType) {
            return res.status(400).json({
                success: false,
                message: 'Missing loan ID or loan type'
            });
        }

        // Query to get all payment records for this loan
        const query = `
            SELECT 
                payment_sequence,
                reference_number,
                amount,
                status,
                payment_method,
                created_at,
                updated_at
            FROM loan_payments
            WHERE loan_id = ? AND loan_type = ?
            ORDER BY payment_sequence ASC
        `;

        db.query(query, [loanId, loanType], (error, results) => {
            if (error) {
                console.error('❌ Error fetching payment status:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Database error while fetching payment status',
                    error: error.message
                });
            }

            console.log('✅ Payment records found:', results.length);

            res.json({
                success: true,
                payments: results,
                totalPayments: results.length,
                paidCount: results.filter(p => p.status === 'Completed').length,
                pendingCount: results.filter(p => p.status === 'Pending').length,
                failedCount: results.filter(p => p.status === 'Failed').length
            });
        });
    } catch (error) {
        console.error('❌ Error in getAdminPaymentStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Payment Status (for Admin)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status, adminNotes } = req.body;

        console.log('🔄 Admin updating payment status:', paymentId, 'to', status);

        // Validate status
        const validStatuses = ['Pending', 'Completed', 'Failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be Pending, Completed, or Failed'
            });
        }

        const updateQuery = `
            UPDATE loan_payments 
            SET status = ?,
                admin_notes = ?,
                updated_at = NOW()
            WHERE id = ?
        `;

        db.query(updateQuery, [status, adminNotes || null, paymentId], (error, result) => {
            if (error) {
                console.error('❌ Error updating payment status:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update payment status',
                    error: error.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment record not found'
                });
            }

            console.log('✅ Payment status updated successfully');

            res.json({
                success: true,
                message: 'Payment status updated successfully'
            });
        });
    } catch (error) {
        console.error('❌ Error in updatePaymentStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = Payment;