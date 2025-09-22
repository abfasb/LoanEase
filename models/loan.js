// Loan.js
const db = require('../config/db');

class Loan {
    // Regular Agricultural Loan Methods

    // Create new regular agricultural transaction
    static createRegularAgriculturalTransaction(transactionData, callback) {
        const query = `
            INSERT INTO regular_agricultural_transaction (
                cb_number, property_value, max_loan_amount, loan_application_type,
                loan_amount, previous_balance, new_balance, service_fee,
                processing_fee, total_deductions, total_loan_received, member_fee,
                share_capital, bayanihan_savings, advance_interest, total_or_amount,
                take_home_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.query(query, [
            transactionData.cb_number,
            transactionData.property_value,
            transactionData.max_loan_amount,
            transactionData.loan_application_type,
            transactionData.loan_amount,
            transactionData.previous_balance,
            transactionData.new_balance,
            transactionData.service_fee,
            transactionData.processing_fee,
            transactionData.total_deductions,
            transactionData.total_loan_received,
            transactionData.member_fee,
            transactionData.share_capital,
            transactionData.bayanihan_savings,
            transactionData.advance_interest,
            transactionData.total_or_amount,
            transactionData.take_home_amount
        ], callback);
    }

    // Update existing regular agricultural transaction
    static updateRegularAgriculturalTransaction(transactionData, callback) {
        const query = `
            UPDATE regular_agricultural_transaction SET
                property_value = ?,
                max_loan_amount = ?,
                loan_application_type = ?,
                loan_amount = ?,
                previous_balance = ?,
                new_balance = ?,
                service_fee = ?,
                processing_fee = ?,
                total_deductions = ?,
                total_loan_received = ?,
                member_fee = ?,
                share_capital = ?,
                bayanihan_savings = ?,
                advance_interest = ?,
                total_or_amount = ?,
                take_home_amount = ?
            WHERE cb_number = ?
        `;
        
        db.query(query, [
            transactionData.property_value,
            transactionData.max_loan_amount,
            transactionData.loan_application_type,
            transactionData.loan_amount,
            transactionData.previous_balance,
            transactionData.new_balance,
            transactionData.service_fee,
            transactionData.processing_fee,
            transactionData.total_deductions,
            transactionData.total_loan_received,
            transactionData.member_fee,
            transactionData.share_capital,
            transactionData.bayanihan_savings,
            transactionData.advance_interest,
            transactionData.total_or_amount,
            transactionData.take_home_amount,
            transactionData.cb_number
        ], callback);
    }

    // Get regular agricultural transaction by CB number
    static getRegularAgriculturalTransaction(cbNumber, callback) {
        const query = `
            SELECT * FROM regular_agricultural_transaction 
            WHERE cb_number = ?
        `;
        db.query(query, [cbNumber], (err, results) => {
            if (err) {
                console.error(`❌ Error fetching transaction for CB ${cbNumber}:`, err);
                return callback(err, null);
            }
            callback(null, results[0] || null);
        });
    }

    // Update loan application status
    static updateLoanApplicationStatus(cbNumber, status, callback) {
        const query = `
            UPDATE salary_bonuses_loans 
            SET application_status = ?, 
                last_updated = CURRENT_TIMESTAMP 
            WHERE cb_number = ?
        `;
        db.query(query, [status, cbNumber], callback);
    }

    // Fetch all Regular Agricultural Loans
    static getAllRegularLoans(callback) {
        const query = 'SELECT * FROM regular_agricultural_loans';
        db.query(query, (err, results) => {
            if (err) {
                console.error('❌ Error fetching Regular Loans:', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    // Fetch all Regular Agricultural Loan Releases
    static getAllRegularLoanReleases(callback) {
        const query = `
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
        `;
        db.query(query, callback);
    }

    // Salary/Bonus Loan Methods

    // Fetch all Salary/Bonuses Loans
    static getAllSalaryBonusLoans(callback) {
        const query = 'SELECT * FROM salary_bonuses_loans';
        db.query(query, (err, results) => {
            if (err) {
                console.error('❌ Error fetching Salary/Bonuses Loans:', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    }

    // Get Salary/Bonus loan by CB number
    static getSalaryBonusLoanByCbNumber(cbNumber, callback) {
        const query = 'SELECT * FROM salary_bonuses_loans WHERE cb_number = ?';
        db.query(query, [cbNumber], (err, results) => {
            if (err) {
                console.error(`❌ Error fetching Salary/Bonuses Loan for CB Number ${cbNumber}:`, err);
                return callback(err, null);
            }
            callback(null, results[0] || null);
        });
    }

    // Get Salary/Bonus transaction by CB number
    static getSalaryBonusTransaction(cbNumber, callback) {
        const query = 'SELECT * FROM salary_loan_transactions WHERE cb_number = ?';
        db.query(query, [cbNumber], (err, results) => {
            if (err) {
                console.error(`❌ Error fetching Salary/Bonus transaction for CB ${cbNumber}:`, err);
                return callback(err, null);
            }
            callback(null, results[0] || null);
        });
    }

    // Create new Salary/Bonus transaction
    static createSalaryBonusTransaction(transactionData, callback) {
        const query = `
            INSERT INTO salary_loan_transactions (
                cb_number, loan_type, loan_amount, previous_balance, new_balance,
                service_fee, processing_fee, total_deductions, total_loan_received,
                loan_application_type, member_fee, share_capital, bayanihan_savings,
                bonus_type, mid_year_amount, year_end_amount, mid_year_interest,
                year_end_interest, total_interest, cbu, interest_fee, total_or_amount,
                take_home_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [
            transactionData.cb_number,
            transactionData.loan_type,
            transactionData.loan_amount,
            transactionData.previous_balance,
            transactionData.new_balance,
            transactionData.service_fee,
            transactionData.processing_fee,
            transactionData.total_deductions,
            transactionData.total_loan_received,
            transactionData.loan_application_type || null,
            transactionData.member_fee || 0,
            transactionData.share_capital || 0,
            transactionData.bayanihan_savings || 0,
            transactionData.bonus_type || null,
            transactionData.mid_year_amount || null,
            transactionData.year_end_amount || null,
            transactionData.mid_year_interest || null,
            transactionData.year_end_interest || null,
            transactionData.total_interest || null,
            transactionData.cbu || 0,
            transactionData.interest_fee || null,
            transactionData.total_or_amount,
            transactionData.take_home_amount
        ], callback);
    }

    // Update existing Salary/Bonus transaction
    static updateSalaryBonusTransaction(transactionData, callback) {
        const query = `
            UPDATE salary_loan_transactions SET
                loan_type = ?, loan_amount = ?, previous_balance = ?, new_balance = ?,
                service_fee = ?, processing_fee = ?, total_deductions = ?, total_loan_received = ?,
                loan_application_type = ?, member_fee = ?, share_capital = ?, bayanihan_savings = ?,
                bonus_type = ?, mid_year_amount = ?, year_end_amount = ?, mid_year_interest = ?,
                year_end_interest = ?, total_interest = ?, cbu = ?, interest_fee = ?,
                total_or_amount = ?, take_home_amount = ?
            WHERE cb_number = ?
        `;
        db.query(query, [
            transactionData.loan_type,
            transactionData.loan_amount,
            transactionData.previous_balance,
            transactionData.new_balance,
            transactionData.service_fee,
            transactionData.processing_fee,
            transactionData.total_deductions,
            transactionData.total_loan_received,
            transactionData.loan_application_type || null,
            transactionData.member_fee || 0,
            transactionData.share_capital || 0,
            transactionData.bayanihan_savings || 0,
            transactionData.bonus_type || null,
            transactionData.mid_year_amount || null,
            transactionData.year_end_amount || null,
            transactionData.mid_year_interest || null,
            transactionData.year_end_interest || null,
            transactionData.total_interest || null,
            transactionData.cbu || 0,
            transactionData.interest_fee || null,
            transactionData.total_or_amount,
            transactionData.take_home_amount,
            transactionData.cb_number
        ], callback);
    }

    // Fetch all Salary Loan Releases
    static getAllSalaryLoanReleases(callback) {
        const query = `
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
        `;
        db.query(query, callback);
    }

    // Get Regular Agricultural Loan by CB number
    static getRegularAgriculturalLoanByCbNumber(cbNumber, callback) {
        const query = `
            SELECT * FROM regular_agricultural_loans
            WHERE cb_number = ?
            LIMIT 1
        `;
        db.query(query, [cbNumber], (err, results) => {
            if (err) {
                console.error(`❌ Error fetching Regular Agricultural Loan for CB ${cbNumber}:`, err);
                return callback(err, null);
            }
            callback(null, results.length > 0 ? results[0] : null);
        });
    }

    // Get Salary/Bonus transaction by CB number (existing method retained for compatibility)
    static getSalaryBonusLoanTransactionByCbNumber(cbNumber, callback) {
        const query = 'SELECT * FROM salary_loan_transactions WHERE cb_number = ?';
        db.query(query, [cbNumber], (err, results) => {
            if (err) {
                console.error(`❌ Error fetching Salary/Bonus transaction for CB ${cbNumber}:`, err);
                return callback(err, null);
            }
            callback(null, results[0] || null);
        });
    }
}

module.exports = Loan;