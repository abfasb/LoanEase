const db = require('../config/db');
const Loan = require('../models/Loan');
const Payment = require('../models/LoanPayment');

// Formatting utilities
const formatCurrency = amount => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
};

const formatTime = date => {
    return date.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatDate = date => {
    return date.toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Fixed getDashboard function with callback-based queries (since your db doesn't support promises)
exports.getDashboard = async (req, res) => {
    try {
        const user = req.user; // Assuming you have user from auth middleware

        // Helper function to promisify db.query
        const queryAsync = (sql, params = []) => {
            return new Promise((resolve, reject) => {
                db.query(sql, params, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        };

        // Fetch stats
        const paymentsRows = await queryAsync(`
            SELECT 
                COALESCE(SUM(amount_paid), 0) AS totalPayments,
                COUNT(*) AS transactionCount,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completedCount
            FROM loan_payments 
            WHERE DATE(created_at) = CURDATE()
        `);

        // Fix: Query overdue loans properly based on your actual database structure
        const overdueRows = await queryAsync(`
            SELECT COUNT(DISTINCT loan_id) AS overdueCount 
            FROM loan_payments 
            WHERE next_deduction_date IS NOT NULL 
            AND next_deduction_date < CURDATE() 
            AND status != 'Completed'
        `);

        const stats = {
            totalPayments: parseFloat(paymentsRows[0].totalPayments),
            transactionCount: parseInt(paymentsRows[0].transactionCount),
            completedCount: parseInt(paymentsRows[0].completedCount),
            overdueCount: parseInt(overdueRows[0].overdueCount)
        };

        // Fetch recent payments (latest 3) - Fixed query to match your actual database structure
        const recentRows = await queryAsync(`
            SELECT 
                lp.payment_id,
                lp.cb_number,
                CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS customer_name,
                lp.amount_paid as amount,
                lp.status,
                lp.created_at as payment_date
            FROM loan_payments lp
            LEFT JOIN members m ON lp.cb_number = m.cb_number
            WHERE DATE(lp.created_at) = CURDATE()
            ORDER BY lp.created_at DESC
            LIMIT 3
        `);

        const recentPayments = recentRows.map(payment => ({
            payment_id: payment.payment_id,
            customer_name: payment.customer_name || 'Unknown Customer',
            amount: parseFloat(payment.amount) || 0,
            status: payment.status,
            payment_date: payment.payment_date
        }));

        res.render('cashier/dashboard', {
            user: user,
            stats: stats,
            recentPayments: recentPayments // Now properly defined and passed
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        
        // Fallback data structure
        const fallbackStats = { 
            totalPayments: 0, 
            transactionCount: 0, 
            completedCount: 0, 
            overdueCount: 0 
        };
        const fallbackRecentPayments = [];
        
        res.render('cashier/dashboard', {
            user: { name: 'Error User' },
            stats: fallbackStats,
            recentPayments: fallbackRecentPayments // Consistent fallback
        });
    }
};
// Active Loans
exports.getActiveLoans = async (req, res) => {
    try {
        const [regularLoans, salaryLoans] = await Promise.all([
            new Promise((resolve, reject) => {
                Loan.getAllRegularLoanReleases((err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            }),
            new Promise((resolve, reject) => {
                Loan.getAllSalaryLoanReleases((err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            })
        ]);

        const allLoans = [...regularLoans, ...salaryLoans].map(loan => ({
            ...loan,
            loan_amount: parseFloat(loan.loan_amount) || 0,
            service_fee: parseFloat(loan.service_fee) || 0,
            processing_fee: parseFloat(loan.processing_fee) || 0,
            total_deductions: parseFloat(loan.total_deductions) || 0,
            total_loan_received: parseFloat(loan.total_loan_received) || 0,
            take_home_amount: parseFloat(loan.take_home_amount) || 0,
            transaction_date: new Date(loan.transaction_date)
        }));

        res.render('cashier/active-loans', {
            user: req.user || { name: 'Cashier' },
            loans: allLoans
        });
    } catch (error) {
        console.error('Active Loans error:', error);
        res.status(500).send('Error loading active loans');
    }
};

// API Endpoint for Loan Details
exports.getLoanDetails = async (req, res) => {
    try {
        const { loanId } = req.params;

        const [regularLoan, salaryLoan] = await Promise.all([
            new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        transaction_id AS id, 
                        cb_number, 
                        'Regular/Agricultural' AS loan_type, 
                        loan_amount, 
                        service_fee, 
                        processing_fee, 
                        total_deductions, 
                        total_loan_received, 
                        take_home_amount, 
                        transaction_date 
                    FROM regular_agricultural_transaction 
                    WHERE transaction_id = ?`, 
                    [loanId], 
                    (err, results) => {
                        if (err) reject(err);
                        resolve(results[0] || null);
                    }
                );
            }),
            new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        id, 
                        cb_number, 
                        loan_type, 
                        loan_amount, 
                        service_fee, 
                        processing_fee, 
                        total_deductions, 
                        total_loan_received, 
                        take_home_amount, 
                        transaction_date 
                    FROM salary_loan_transactions 
                    WHERE id = ?`, 
                    [loanId], 
                    (err, results) => {
                        if (err) reject(err);
                        resolve(results[0] || null);
                    }
                );
            })
        ]);

        const loanDetails = regularLoan || salaryLoan;

        if (!loanDetails) {
            return res.status(404).json({ success: false, message: 'Loan not found' });
        }

        res.json({
            success: true,
            data: {
                id: loanDetails.id,
                cb_number: loanDetails.cb_number,
                loan_type: loanDetails.loan_type,
                loan_amount: parseFloat(loanDetails.loan_amount) || 0,
                service_fee: parseFloat(loanDetails.service_fee) || 0,
                processing_fee: parseFloat(loanDetails.processing_fee) || 0,
                total_deductions: parseFloat(loanDetails.total_deductions) || 0,
                total_loan_received: parseFloat(loanDetails.total_loan_received) || 0,
                take_home_amount: parseFloat(loanDetails.take_home_amount) || 0,
                transaction_date: new Date(loanDetails.transaction_date).toISOString()
            }
        });
    } catch (error) {
        console.error('Loan Details error:', error);
        res.status(500).json({ success: false, message: 'Error fetching loan details' });
    }
};

// Loan Payments
exports.getLoanPayments = async (req, res) => {
    try {
        const payments = await new Promise((resolve, reject) => {
            db.query(`
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
            `, (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        const formattedPayments = payments.map(payment => ({
            payment_id: payment.payment_id,
            cb_number: payment.cb_number,
            loan_id: payment.loan_id,
            member_name: payment.member_name || 'Unknown',
            loan_type: payment.loan_type,
            payment_method: payment.payment_method,
            amount_paid: parseFloat(payment.amount_paid) || 0,
            payment_type: payment.payment_type,
            reference_number: payment.reference_number,
            payment_sequence: payment.payment_sequence || 1,
            status: payment.status,
            created_at: new Date(payment.created_at).toISOString(),
            gcash_reference: payment.gcash_reference || null,
            gcash_fullname: payment.gcash_fullname || null,
            atm_card_last4: payment.atm_card_last4 || null,
            atm_bank: payment.atm_bank || null,
            atm_fullname: payment.atm_fullname || null,
            next_deduction_date: payment.next_deduction_date ? new Date(payment.next_deduction_date).toISOString().split('T')[0] : null,
            otc_fullname: payment.otc_fullname || null,
            otc_payment_date: payment.otc_payment_date ? new Date(payment.otc_payment_date).toISOString().split('T')[0] : null,
            otc_payment_time: payment.otc_payment_time || null,
            otc_payment_method: payment.otc_payment_method || null,
            otc_check_number: payment.otc_check_number || null
        }));

        res.render('cashier/loan-payments', {
            user: req.user || { name: 'Cashier' },
            payments: formattedPayments,
            formatCurrency
        });
    } catch (error) {
        console.error('Loan Payments error:', error);
        res.status(500).send('Error loading loan payments');
    }
};

// API Endpoint to Fetch Payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await new Promise((resolve, reject) => {
            db.query(`
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
            `, (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        const formattedPayments = payments.map(payment => ({
            payment_id: payment.payment_id,
            cb_number: payment.cb_number,
            loan_id: payment.loan_id,
            member_name: payment.member_name || 'Unknown',
            loan_type: payment.loan_type,
            payment_method: payment.payment_method,
            amount_paid: parseFloat(payment.amount_paid) || 0,
            payment_type: payment.payment_type,
            reference_number: payment.reference_number,
            payment_sequence: payment.payment_sequence || 1,
            status: payment.status,
            created_at: new Date(payment.created_at).toISOString(),
            gcash_reference: payment.gcash_reference || null,
            gcash_fullname: payment.gcash_fullname || null,
            atm_card_last4: payment.atm_card_last4 || null,
            atm_bank: payment.atm_bank || null,
            atm_fullname: payment.atm_fullname || null,
            next_deduction_date: payment.next_deduction_date ? new Date(payment.next_deduction_date).toISOString().split('T')[0] : null,
            otc_fullname: payment.otc_fullname || null,
            otc_payment_date: payment.otc_payment_date ? new Date(payment.otc_payment_date).toISOString().split('T')[0] : null,
            otc_payment_time: payment.otc_payment_time || null,
            otc_payment_method: payment.otc_payment_method || null,
            otc_check_number: payment.otc_check_number || null
        }));

        res.json({
            success: true,
            payments: formattedPayments
        });
    } catch (error) {
        console.error('Get Payments API error:', error);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
};

// API Endpoint to Approve Payment
exports.approvePayment = async (req, res) => {
    try {
        const { paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json({ success: false, message: 'Payment ID is required' });
        }

        await new Promise((resolve, reject) => {
            Payment.updateStatus(paymentId, 'Completed', (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        res.json({ success: true, message: 'Payment approved successfully' });
    } catch (error) {
        console.error('Approve Payment error:', error);
        res.status(500).json({ success: false, message: 'Error approving payment' });
    }
};

// API Endpoint to Reject Payment
exports.rejectPayment = async (req, res) => {
    try {
        const { paymentId, reason } = req.body;

        if (!paymentId || !reason) {
            return res.status(400).json({ success: false, message: 'Payment ID and reason are required' });
        }

        await new Promise((resolve, reject) => {
            Payment.updateStatus(paymentId, 'Failed', (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        await new Promise((resolve, reject) => {
            db.query('INSERT INTO payment_rejections (payment_id, reason) VALUES (?, ?)', 
                [paymentId, reason], 
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });

        res.json({ success: true, message: 'Payment rejected successfully' });
    } catch (error) {
        console.error('Reject Payment error:', error);
        res.status(500).json({ success: false, message: 'Error rejecting payment' });
    }
};

// API Endpoint to Fetch Payments by Member
exports.getPaymentsByMember = async (req, res) => {
    try {
        const { cb_number } = req.params;

        const payments = await new Promise((resolve, reject) => {
            db.query(`
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
                    CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS member_name
                FROM loan_payments lp
                LEFT JOIN members m ON lp.cb_number = m.cb_number
                WHERE lp.cb_number = ? AND lp.status = 'Completed'
                ORDER BY lp.created_at DESC
            `, [cb_number], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        const formattedPayments = payments.map(payment => ({
            payment_id: payment.payment_id,
            cb_number: payment.cb_number,
            loan_id: payment.loan_id,
            member_name: payment.member_name || 'Unknown',
            loan_type: payment.loan_type,
            payment_method: payment.payment_method,
            amount_paid: parseFloat(payment.amount_paid) || 0,
            payment_type: payment.payment_type,
            reference_number: payment.reference_number,
            payment_sequence: payment.payment_sequence || 1,
            status: payment.status,
            created_at: new Date(payment.created_at).toISOString()
        }));

        res.json({
            success: true,
            payments: formattedPayments
        });
    } catch (error) {
        console.error('Get Payments by Member error:', error);
        res.status(500).json({ success: false, message: 'Error fetching member payments' });
    }
};

// Payment Collections
exports.getPaymentCollections = async (req, res) => {
    try {
        const members = await new Promise((resolve, reject) => {
            db.query(`
                SELECT 
                    lp.cb_number,
                    CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS member_name,
                    lp.loan_id,
                    SUM(lp.amount_paid) AS total_amount_paid,
                    MAX(lp.created_at) AS last_payment_date
                FROM loan_payments lp
                LEFT JOIN members m ON lp.cb_number = m.cb_number
                WHERE lp.status = 'Completed'
                GROUP BY lp.cb_number, lp.loan_id, m.first_name, m.middle_name, m.last_name
                ORDER BY last_payment_date DESC
            `, (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        const formattedMembers = members.map(member => ({
            cb_number: member.cb_number,
            member_name: member.member_name || 'Unknown',
            loan_id: member.loan_id,
            total_amount_paid: parseFloat(member.total_amount_paid) || 0,
            last_payment_date: new Date(member.last_payment_date)
        }));

        res.render('cashier/payment-collections', {
            user: req.user || { name: 'Cashier' },
            members: formattedMembers.map(member => ({
                ...member,
                total_amount_paid_formatted: formatCurrency(member.total_amount_paid),
                last_payment_date_formatted: member.last_payment_date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            })),
            formatCurrency
        });
    } catch (error) {
        console.error('Payment Collections error:', error);
        res.status(500).send('Error loading payment collections');
    }
};

exports.postPaymentCollections = async (req, res) => {
    try {
        const { cb_number, loan_id, amount, payment_method, payment_type, reference_number } = req.body;

        if (!cb_number || !loan_id || !amount || !payment_method || !payment_type || !reference_number) {
            return res.status(400).send('All required fields must be provided');
        }

        // Validate cb_number exists in members
        const memberExists = await new Promise((resolve, reject) => {
            db.query('SELECT cb_number FROM members WHERE cb_number = ?', [cb_number], (err, results) => {
                if (err) reject(err);
                resolve(results.length > 0);
            });
        });

        if (!memberExists) {
            return res.status(400).send('Invalid CB Number');
        }

        // Validate loan_id exists in either regular_agricultural_transaction or salary_loan_transactions
        const loanExists = await new Promise((resolve, reject) => {
            db.query(`
                SELECT id FROM salary_loan_transactions WHERE id = ?
                UNION
                SELECT transaction_id AS id FROM regular_agricultural_transaction WHERE transaction_id = ?
            `, [loan_id, loan_id], (err, results) => {
                if (err) reject(err);
                resolve(results.length > 0);
            });
        });

        if (!loanExists) {
            return res.status(400).send('Invalid Loan ID');
        }

        // Determine loan_type based on loan_id
        const loanTypeResult = await new Promise((resolve, reject) => {
            db.query(`
                SELECT loan_type FROM salary_loan_transactions WHERE id = ?
                UNION
                SELECT 'Regular/Agricultural' AS loan_type FROM regular_agricultural_transaction WHERE transaction_id = ?
            `, [loan_id, loan_id], (err, results) => {
                if (err) reject(err);
                resolve(results[0]?.loan_type || 'Unknown');
            });
        });

        if (loanTypeResult === 'Unknown') {
            return res.status(400).send('Unable to determine loan type');
        }

        const paymentData = {
            cb_number,
            loan_id,
            loan_type: loanTypeResult,
            payment_method,
            amount_paid: parseFloat(amount),
            payment_type,
            reference_number,
            status: 'Pending',
            payment_sequence: await new Promise((resolve, reject) => {
                Payment.getNextPaymentSequence(loan_id, loanTypeResult, (err, sequence) => {
                    if (err) reject(err);
                    resolve(sequence);
                });
            })
        };

        await new Promise((resolve, reject) => {
            Payment.create(paymentData, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        res.redirect('/cashier/payment-collections');
    } catch (error) {
        console.error('Payment Collections POST error:', error);
        res.status(500).send('Error recording payment');
    }
};

// Reports
exports.getReports = async (req, res) => {
    try {
        res.render('cashier/reports', {
            user: req.user || { name: 'Cashier' },
            reportData: null,
            startDate: '',
            endDate: ''
        });
    } catch (error) {
        console.error('Reports error:', error);
        res.status(500).send('Error loading reports');
    }
};

exports.generateReport = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        let reportData = null;
        const queryParams = [];
        let dateFilter = '';

        if (startDate && endDate) {
            dateFilter = 'WHERE transaction_date BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        }

        if (type === 'loanSummary') {
            const loans = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        sl.id AS loan_id,
                        sl.cb_number,
                        sl.loan_type,
                        sl.loan_amount,
                        sl.transaction_date,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS borrower
                    FROM salary_loan_transactions sl
                    LEFT JOIN members m ON sl.cb_number = m.cb_number
                    ${dateFilter}
                    UNION
                    SELECT 
                        ra.transaction_id AS loan_id,
                        ra.cb_number,
                        'Regular/Agricultural' AS loan_type,
                        ra.loan_amount,
                        ra.transaction_date,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS borrower
                    FROM regular_agricultural_transaction ra
                    LEFT JOIN members m ON ra.cb_number = m.cb_number
                    ${dateFilter}
                    ORDER BY transaction_date DESC
                `, dateFilter ? [...queryParams, ...queryParams] : [], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            reportData = {
                title: 'Loan Summary Report',
                headers: ['Loan ID', 'Borrower', 'Loan Type', 'Amount', 'Date'],
                rows: loans.map(loan => [
                    loan.loan_id,
                    loan.borrower || 'Unknown',
                    loan.loan_type,
                    formatCurrency(loan.loan_amount),
                    new Date(loan.transaction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                ])
            };
        } else if (type === 'paymentSummary') {
            const paymentDateFilter = startDate && endDate 
                ? 'AND lp.created_at BETWEEN ? AND ?' 
                : '';
            const params = startDate && endDate 
                ? [startDate, endDate] 
                : [];
            const payments = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        lp.payment_id,
                        lp.cb_number,
                        lp.loan_id,
                        lp.loan_type,
                        lp.amount_paid,
                        lp.created_at,
                        lp.payment_method,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS member_name
                    FROM loan_payments lp
                    LEFT JOIN members m ON lp.cb_number = m.cb_number
                    WHERE lp.status = 'Completed' ${paymentDateFilter}
                    ORDER BY lp.created_at DESC
                `, params, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            reportData = {
                title: 'Payment Summary Report',
                headers: ['Payment ID', 'Member', 'Loan ID', 'Loan Type', 'Amount', 'Date', 'Method'],
                rows: payments.map(payment => [
                    payment.payment_id,
                    payment.member_name || 'Unknown',
                    payment.loan_id,
                    payment.loan_type,
                    formatCurrency(payment.amount_paid),
                    new Date(payment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    payment.payment_method
                ])
            };
        } else if (type === 'overdueLoans') {
            const currentDate = new Date().toISOString().split('T')[0];
            const overdueLoans = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        sl.id AS loan_id,
                        sl.cb_number,
                        sl.loan_type,
                        sl.loan_amount,
                        sl.transaction_date,
                        lp.next_deduction_date,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS borrower,
                        COALESCE(SUM(lp.amount_paid), 0) AS total_paid
                    FROM salary_loan_transactions sl
                    LEFT JOIN members m ON sl.cb_number = m.cb_number
                    LEFT JOIN loan_payments lp ON sl.id = lp.loan_id AND lp.loan_type = sl.loan_type AND lp.status = 'Completed'
                    ${dateFilter}
                    GROUP BY sl.id, sl.cb_number, sl.loan_type, sl.loan_amount, sl.transaction_date, lp.next_deduction_date, m.first_name, m.middle_name, m.last_name
                    HAVING lp.next_deduction_date IS NOT NULL AND lp.next_deduction_date < ? AND total_paid < sl.loan_amount
                    UNION
                    SELECT 
                        ra.transaction_id AS loan_id,
                        ra.cb_number,
                        'Regular/Agricultural' AS loan_type,
                        ra.loan_amount,
                        ra.transaction_date,
                        lp.next_deduction_date,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS borrower,
                        COALESCE(SUM(lp.amount_paid), 0) AS total_paid
                    FROM regular_agricultural_transaction ra
                    LEFT JOIN members m ON ra.cb_number = m.cb_number
                    LEFT JOIN loan_payments lp ON ra.transaction_id = lp.loan_id AND lp.loan_type = 'Regular/Agricultural' AND lp.status = 'Completed'
                    ${dateFilter}
                    GROUP BY ra.transaction_id, ra.cb_number, ra.loan_amount, ra.transaction_date, lp.next_deduction_date, m.first_name, m.middle_name, m.last_name
                    HAVING lp.next_deduction_date IS NOT NULL AND lp.next_deduction_date < ? AND total_paid < ra.loan_amount
                    ORDER BY next_deduction_date DESC
                `, dateFilter ? [...queryParams, currentDate, ...queryParams, currentDate] : [currentDate, currentDate], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            reportData = {
                title: 'Overdue Loans Report',
                headers: ['Loan ID', 'Borrower', 'Loan Type', 'Amount', 'Total Paid', 'Due Date'],
                rows: overdueLoans.map(loan => [
                    loan.loan_id,
                    loan.borrower || 'Unknown',
                    loan.loan_type,
                    formatCurrency(loan.loan_amount),
                    formatCurrency(loan.total_paid),
                    new Date(loan.next_deduction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                ])
            };
        }

        res.render('cashier/reports', {
            user: req.user || { name: 'Cashier' },
            reportData,
            startDate: startDate || '',
            endDate: endDate || ''
        });
    } catch (error) {
        console.error('Generate Report error:', error);
        res.status(500).send('Error generating report');
    }
};

// API Endpoint for Report Details
exports.getReportDetails = async (req, res) => {
    try {
        const { type, id } = req.params;

        if (type === 'loanSummary') {
            const loan = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        sl.id AS loan_id,
                        sl.cb_number,
                        sl.loan_type,
                        sl.loan_amount,
                        sl.service_fee,
                        sl.processing_fee,
                        sl.total_deductions,
                        sl.total_loan_received,
                        sl.take_home_amount,
                        sl.transaction_date,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS borrower
                    FROM salary_loan_transactions sl
                    LEFT JOIN members m ON sl.cb_number = m.cb_number
                    WHERE sl.id = ?
                    UNION
                    SELECT 
                        ra.transaction_id AS loan_id,
                        ra.cb_number,
                        'Regular/Agricultural' AS loan_type,
                        ra.loan_amount,
                        ra.service_fee,
                        ra.processing_fee,
                        ra.total_deductions,
                        ra.total_loan_received,
                        ra.take_home_amount,
                        ra.transaction_date,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS borrower
                    FROM regular_agricultural_transaction ra
                    LEFT JOIN members m ON ra.cb_number = m.cb_number
                    WHERE ra.transaction_id = ?
                `, [id, id], (err, results) => {
                    if (err) reject(err);
                    resolve(results[0] || null);
                });
            });

            if (!loan) {
                return res.status(404).json({ success: false, message: 'Loan not found' });
            }

            res.json({
                success: true,
                details: [
                    { label: 'Loan ID', value: loan.loan_id },
                    { label: 'Borrower', value: loan.borrower || 'Unknown' },
                    { label: 'Loan Type', value: loan.loan_type },
                    { label: 'Loan Amount', value: formatCurrency(loan.loan_amount) },
                    { label: 'Service Fee', value: formatCurrency(loan.service_fee || 0) },
                    { label: 'Processing Fee', value: formatCurrency(loan.processing_fee || 0) },
                    { label: 'Total Deductions', value: formatCurrency(loan.total_deductions || 0) },
                    { label: 'Total Loan Received', value: formatCurrency(loan.total_loan_received || 0) },
                    { label: 'Take Home Amount', value: formatCurrency(loan.take_home_amount || 0) },
                    { label: 'Transaction Date', value: new Date(loan.transaction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
                ]
            });
        } else if (type === 'paymentSummary') {
            const payment = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        lp.payment_id,
                        lp.cb_number,
                        lp.loan_id,
                        lp.loan_type,
                        lp.amount_paid,
                        lp.payment_method,
                        lp.payment_type,
                        lp.reference_number,
                        lp.created_at,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS member_name
                    FROM loan_payments lp
                    LEFT JOIN members m ON lp.cb_number = m.cb_number
                    WHERE lp.payment_id = ?
                `, [id], (err, results) => {
                    if (err) reject(err);
                    resolve(results[0] || null);
                });
            });

            if (!payment) {
                return res.status(404).json({ success: false, message: 'Payment not found' });
            }

            res.json({
                success: true,
                details: [
                    { label: 'Payment ID', value: payment.payment_id },
                    { label: 'Member', value: payment.member_name || 'Unknown' },
                    { label: 'Loan ID', value: payment.loan_id },
                    { label: 'Loan Type', value: payment.loan_type },
                    { label: 'Amount', value: formatCurrency(payment.amount_paid) },
                    { label: 'Payment Method', value: payment.payment_method },
                    { label: 'Payment Type', value: payment.payment_type },
                    { label: 'Reference Number', value: payment.reference_number },
                    { label: 'Date', value: new Date(payment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
                ]
            });
        } else if (type === 'overdueLoans') {
            const loan = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        sl.id AS loan_id,
                        sl.cb_number,
                        sl.loan_type,
                        sl.loan_amount,
                        sl.transaction_date,
                        lp.next_deduction_date,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS borrower,
                        COALESCE(SUM(lp.amount_paid), 0) AS total_paid
                    FROM salary_loan_transactions sl
                    LEFT JOIN members m ON sl.cb_number = m.cb_number
                    LEFT JOIN loan_payments lp ON sl.id = lp.loan_id AND lp.loan_type = sl.loan_type AND lp.status = 'Completed'
                    WHERE sl.id = ?
                    GROUP BY sl.id, sl.cb_number, sl.loan_type, sl.loan_amount, sl.transaction_date, lp.next_deduction_date
                    HAVING lp.next_deduction_date IS NOT NULL
                    UNION
                    SELECT 
                        ra.transaction_id AS loan_id,
                        ra.cb_number,
                        'Regular/Agricultural' AS loan_type,
                        ra.loan_amount,
                        ra.transaction_date,
                        lp.next_deduction_date,
                        CONCAT(m.first_name, ' ', COALESCE(m.middle_name, ''), ' ', m.last_name) AS borrower,
                        COALESCE(SUM(lp.amount_paid), 0) AS total_paid
                    FROM regular_agricultural_transaction ra
                    LEFT JOIN members m ON ra.cb_number = m.cb_number
                    LEFT JOIN loan_payments lp ON ra.transaction_id = lp.loan_id AND lp.loan_type = 'Regular/Agricultural' AND lp.status = 'Completed'
                    WHERE ra.transaction_id = ?
                    GROUP BY ra.transaction_id, ra.cb_number, ra.loan_amount, ra.transaction_date, lp.next_deduction_date
                    HAVING lp.next_deduction_date IS NOT NULL
                `, [id, id], (err, results) => {
                    if (err) reject(err);
                    resolve(results[0] || null);
                });
            });

            if (!loan) {
                return res.status(404).json({ success: false, message: 'Loan not found' });
            }

            res.json({
                success: true,
                details: [
                    { label: 'Loan ID', value: loan.loan_id },
                    { label: 'Borrower', value: loan.borrower || 'Unknown' },
                    { label: 'Loan Type', value: loan.loan_type },
                    { label: 'Loan Amount', value: formatCurrency(loan.loan_amount) },
                    { label: 'Total Paid', value: formatCurrency(loan.total_paid) },
                    { label: 'Due Date', value: new Date(loan.next_deduction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
                    { label: 'Transaction Date', value: new Date(loan.transaction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
                ]
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid report type' });
        }
    } catch (error) {
        console.error('Get Report Details error:', error);
        res.status(500).json({ success: false, message: 'Error fetching report details' });
    }
};

// Logout
exports.getLogout = async (req, res) => {
    try {
        res.render('cashier/logout', { user: req.user || { name: 'Cashier' } });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).send('Error loading logout page');
    }
};

exports.postLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.redirect('/cashier/dashboard');
            }
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Logout POST error:', error);
        res.status(500).send('Error logging out');
    }
};