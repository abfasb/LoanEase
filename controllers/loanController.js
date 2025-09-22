const db = require("../config/db");
const Payment = require('../models/LoanPayment');

// Submit Regular/Agricultural Loan
exports.submitRegularLoan = (req, res) => {
    console.log("📌 Received Data:", req.body);

    const {
        cb_number,
        application_no,
        date_of_application,
        spouse_name,
        address,
        contact_no,
        account_no,
        coop_id,
        loan_type,
        loan_amount,
        annual_income,
        source_of_income,
        security_offered,
        purpose,
        paid_up_capital,
        previous_loan,
        outstanding_balance,
        cbu_status,
        borrower_category,
        loan_balance_status
    } = req.body;

    const application_date = date_of_application;
    const member_address = address;
    const contact_number = contact_no;
    const income_source = source_of_income;
    const collateral = security_offered;
    const loan_purpose = purpose;
    const borrower_type = borrower_category;
    const loan_status = loan_balance_status;

    const missingFields = [];
    if (!cb_number) missingFields.push("cb_number");
    if (!application_no) missingFields.push("application_no");
    if (!application_date) missingFields.push("application_date");
    if (!member_address) missingFields.push("member_address");
    if (!contact_number) missingFields.push("contact_number");
    if (!loan_type) missingFields.push("loan_type");
    if (!loan_amount) missingFields.push("loan_amount");
    if (!cbu_status) missingFields.push("cbu_status");
    if (!borrower_type) missingFields.push("borrower_type");
    if (!loan_status) missingFields.push("loan_status");

    if (missingFields.length > 0) {
        console.log(`❌ Missing Fields: ${missingFields.join(", ")}`);
        return res.json({ success: false, message: `Missing fields: ${missingFields.join(", ")}` });
    }

    const sql = `INSERT INTO regular_agricultural_loans 
                (cb_number, application_no, application_date, spouse_name, member_address, contact_number, account_number, coop_id_number, loan_type, loan_amount, annual_income, income_source, collateral, loan_purpose, paid_up_capital, previous_loan_amount, outstanding_balance, cbu_status, borrower_type, loan_status, application_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`;

    db.query(sql, [
        cb_number,
        application_no,
        application_date,
        spouse_name || null,
        member_address,
        contact_number,
        account_no || null,
        coop_id || null,
        loan_type,
        loan_amount,
        annual_income || null,
        income_source || null,
        collateral || null,
        loan_purpose || null,
        paid_up_capital || null,
        previous_loan || null,
        outstanding_balance || null,
        cbu_status,
        borrower_type,
        loan_status
    ], (err, result) => {
        if (err) {
            console.error("❌ Error inserting data into database:", err.sqlMessage);
            return res.json({ success: false, message: "Failed to submit loan application. Please try again." });
        }

        console.log("✅ Loan application submitted successfully:", result.insertId);
        return res.json({ success: true, message: "Loan application submitted successfully!" });
    });
};
// Submit Salary/Bonuses Loan
exports.submitSalaryBonusLoan = (req, res) => {
    console.log("📌 Received Data:", req.body);

    const {
        cb_number,
        application_no,
        date,
        last_name,
        first_name,
        middle_initial,
        municipality,
        position,
        length_of_service,
        age,
        address,
        office_agency,
        basic_monthly_salary,
        net_take_home_pay,
        spouse_name,
        contact_no,
        loan_type,
        loan_amount
    } = req.body;

    const application_date = date;

    // Fix loan_type handling - it might come as an array or undefined
    let processedLoanType = loan_type;
    if (Array.isArray(loan_type)) {
        // If multiple checkboxes somehow got selected, take the first one
        processedLoanType = loan_type[0];
    } else if (!loan_type) {
        // If no loan type is selected, set a default or handle the error
        processedLoanType = null;
    }

    const missingFields = [];
    if (!cb_number) missingFields.push("cb_number");
    if (!application_no) missingFields.push("application_no");
    if (!application_date) missingFields.push("application_date");
    if (!last_name) missingFields.push("last_name");
    if (!first_name) missingFields.push("first_name");
    if (!position) missingFields.push("position");
    if (!address) missingFields.push("address");
    if (!contact_no) missingFields.push("contact_no");
    if (!processedLoanType) missingFields.push("loan_type");
    if (!loan_amount) missingFields.push("loan_amount");

    if (missingFields.length > 0) {
        console.log(`❌ Missing Fields: ${missingFields.join(", ")}`);
        return res.json({ success: false, message: `Missing fields: ${missingFields.join(", ")}` });
    }

    const sql = `INSERT INTO salary_bonuses_loans 
                (cb_number, application_no, application_date, last_name, first_name, middle_initial, municipality, position, length_of_service, age, address, office_agency, basic_monthly_salary, net_take_home_pay, spouse_name, contact_no, loan_type, loan_amount, application_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`;

    db.query(sql, [
        cb_number,
        application_no,
        application_date,
        last_name,
        first_name,
        middle_initial || null,
        municipality || null,
        position,
        length_of_service || null,
        age || null,
        address,
        office_agency || null,
        basic_monthly_salary || null,
        net_take_home_pay || null,
        spouse_name || null,
        contact_no,
        processedLoanType,
        loan_amount
    ], (err, result) => {
        if (err) {
            console.error("❌ Error inserting data into database:", err.sqlMessage);
            return res.json({ success: false, message: "Failed to submit loan application. Please try again." });
        }

        console.log("✅ Salary/Bonuses Loan application submitted successfully:", result.insertId);
        return res.json({ success: true, message: "Loan application submitted successfully!" });
    });
};

// Fetch Member Loans
exports.getMemberLoans = (req, res) => {
    const { cb_number } = req.user;

    const query = `
        (SELECT 
            id AS loan_id,
            cb_number,
            loan_type,
            loan_amount,
            'APPROVED' AS status,
            service_fee,
            processing_fee,
            total_deductions,
            total_loan_received,
            take_home_amount,
            transaction_date
         FROM salary_loan_transactions 
         WHERE cb_number = ?)
         
         UNION ALL
         
         (SELECT 
            transaction_id AS loan_id,
            cb_number,
            loan_application_type AS loan_type,
            loan_amount,
            'APPROVED' AS status,
            service_fee,
            processing_fee,
            total_deductions,
            total_loan_received,
            take_home_amount,
            transaction_date
         FROM regular_agricultural_transaction 
         WHERE cb_number = ?)
         
         ORDER BY transaction_date DESC`;

    db.query(query, [cb_number, cb_number], (error, results) => {
        if (error) {
            console.error('Error fetching loans:', error);
            return res.status(500).json({ message: 'Error fetching loan status' });
        }
        res.json(results);
    });
};

// Check Approved Loans
exports.checkApprovedLoans = (req, res) => {
    const { cb_number } = req.user;

    const query = `
        SELECT 
            (SELECT COUNT(*) FROM salary_loan_transactions WHERE cb_number = ?) +
            (SELECT COUNT(*) FROM regular_agricultural_transaction WHERE cb_number = ?) 
            AS count`;

    db.query(query, [cb_number, cb_number], (error, results) => {
        if (error) {
            console.error('Error checking approved loans:', error);
            return res.status(500).json({ message: 'Error checking loan status' });
        }
        res.json({ hasApproved: results[0].count > 0 });
    });
};

exports.getLoanStatus = async (req, res) => {
    try {
        const cbNumber = req.session.user.cb_number;
        
        if (!cbNumber) {
            return res.status(400).render('member/loan-status', {
                message: "Member CB number not found",
                messageType: "danger",
                loans: []
            });
        }

        const query = `
            (SELECT 
                id as loan_id,
                cb_number,
                'salary' as loan_type,
                loan_amount,
                'APPROVED' as status,
                service_fee,
                processing_fee,
                total_deductions,
                total_loan_received,
                take_home_amount,
                transaction_date
             FROM salary_loan_transactions 
             WHERE cb_number = ? AND loan_type = 'salary')
             
             UNION ALL
             
             (SELECT 
                transaction_id as loan_id,
                cb_number,
                'agricultural' as loan_type,
                loan_amount,
                'APPROVED' as status,
                service_fee,
                processing_fee,
                total_deductions,
                total_loan_received,
                take_home_amount,
                transaction_date
             FROM regular_agricultural_transaction 
             WHERE cb_number = ?)
             
             UNION ALL
             
             (SELECT 
                id as loan_id,
                cb_number,
                'bonuses' as loan_type,
                loan_amount,
                'APPROVED' as status,
                service_fee,
                processing_fee,
                total_deductions,
                total_loan_received,
                take_home_amount,
                transaction_date
             FROM salary_loan_transactions 
             WHERE cb_number = ? AND loan_type = 'bonuses')
             
             ORDER BY transaction_date DESC`;

        db.query(query, [cbNumber, cbNumber, cbNumber], (error, results) => {
            if (error) {
                console.error('Error fetching loans:', error);
                return res.status(500).render('member/loan-status', {
                    message: "Error retrieving loan status",
                    messageType: "danger",
                    loans: []
                });
            }
            
            // Debug: Log the results to console
            console.log('Loan query results:', results);
            
            res.render('member/loan-status', {
                loans: results,
                currentPage: 'loan-status'
            });
        });

    } catch (error) {
        console.error('Loan status error:', error);
        res.status(500).render('member/loan-status', {
            message: "Error retrieving loan status",
            messageType: "danger",
            loans: []
        });
    }
};

// Check Loan Approval
exports.checkLoanApproval = (req, res) => {
    const cbNumber = req.user?.cb_number;

    const query = `
        SELECT COUNT(*) AS count FROM (
            SELECT 1 FROM salary_loan_transactions WHERE cb_number = ?
            UNION ALL
            SELECT 1 FROM regular_agricultural_transaction WHERE cb_number = ?
        ) AS combined`;

    db.query(query, [cbNumber, cbNumber], (error, results) => {
        if (error) {
            console.error('Error checking approved loans:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ hasApproved: results[0].count > 0 });
    });
};

// Get Loan Risk Assessment
exports.getLoanRiskAssessment = (req, res) => {
    const { application_no, loan_type } = req.params;

    const table = loan_type === 'salary' || loan_type === 'bonuses' 
        ? 'salary_bonuses_loans' 
        : 'regular_agricultural_loans';

    db.query(
        `SELECT * FROM ${table} WHERE application_no = ?`,
        [application_no],
        (error, results) => {
            if (error) {
                console.error('Risk assessment error:', error);
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Application not found' });
            }
            res.json(results[0]);
        }
    );
};

// Get Loan Receipt
exports.getLoanReceipt = (req, res) => {
    const { loan_type, loan_id } = req.params;

    const table = loan_type === 'salary' || loan_type === 'bonuses' 
        ? 'salary_loan_transactions' 
        : 'regular_agricultural_transaction';

    const idField = (loan_type === 'salary' || loan_type === 'bonuses') ? 'id' : 'transaction_id';

    db.query(
        `SELECT * FROM ${table} WHERE ${idField} = ?`,
        [loan_id],
        (error, results) => {
            if (error) {
                console.error('Receipt generation error:', error);
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Loan not found' });
            }

            const loan = results[0];
            res.json({
                receiptData: {
                    loanType: loan_type === 'salary' ? 'Salary Loan' : loan_type === 'bonuses' ? 'Bonuses Loan' : 'Agricultural Loan',
                    memberFee: loan.member_fee || 0,
                    shareCapital: loan.share_capital || 0,
                    bayanihanSavings: loan.bayanihan_savings || 0,
                    advanceInterest: loan.advance_interest || 0,
                    totalORAmount: loan.total_or_amount || 0,
                    transactionDate: loan.transaction_date
                }
            });
        }
    );
};

// Check Loan Approval Status
exports.checkLoanApprovalStatus = (req, res) => {
    const cbNumber = req.user?.cb_number;

    const query = `
        SELECT EXISTS(
            SELECT 1 FROM salary_loan_transactions WHERE cb_number = ?
            UNION ALL
            SELECT 1 FROM regular_agricultural_transaction WHERE cb_number = ?
        ) AS has_approved_loan`;

    db.query(query, [cbNumber, cbNumber], (error, results) => {
        if (error) {
            console.error('Approval check error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ isApproved: results[0].has_approved_loan === 1 });
    });
};