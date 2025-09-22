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
}

module.exports = Payment;