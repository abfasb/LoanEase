const db = require('../config/db');

class Report {
    static getSalaryLoanReports(startDate, endDate, callback) {
        const query = `
            SELECT * FROM salary_loan_transactions 
            WHERE DATE(transaction_date) BETWEEN ? AND ?
            ORDER BY transaction_date DESC
        `;
        db.query(query, [startDate, endDate], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    static getAgriculturalLoanReports(startDate, endDate, callback) {
        const query = `
            SELECT * FROM regular_agricultural_transaction 
            WHERE DATE(transaction_date) BETWEEN ? AND ?
            ORDER BY transaction_date DESC
        `;
        db.query(query, [startDate, endDate], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    static getLoanSummary(callback) {
        const salaryQuery = `
            SELECT 
                COUNT(*) as total_count,
                SUM(loan_amount) as total_amount,
                loan_type,
                loan_application_type
            FROM salary_loan_transactions 
            GROUP BY loan_type, loan_application_type
        `;
        
        const agriculturalQuery = `
            SELECT 
                COUNT(*) as total_count,
                SUM(loan_amount) as total_amount,
                loan_application_type
            FROM regular_agricultural_transaction 
            GROUP BY loan_application_type
        `;
        
        // Execute both queries
        db.query(salaryQuery, (err, salaryResults) => {
            if (err) return callback(err);
            
            db.query(agriculturalQuery, (err, agriculturalResults) => {
                if (err) return callback(err);
                
                callback(null, {
                    salary: salaryResults,
                    agricultural: agriculturalResults
                });
            });
        });
    }

    static exportSalaryReports(startDate, endDate, callback) {
        const query = `
            SELECT 
                cb_number,
                loan_type,
                loan_amount,
                service_fee,
                processing_fee,
                total_deductions,
                take_home_amount,
                transaction_date
            FROM salary_loan_transactions 
            WHERE DATE(transaction_date) BETWEEN ? AND ?
            ORDER BY transaction_date DESC
        `;
        db.query(query, [startDate, endDate], callback);
    }

    static exportAgriculturalReports(startDate, endDate, callback) {
        const query = `
            SELECT 
                cb_number,
                property_value,
                loan_amount,
                service_fee,
                processing_fee,
                total_deductions,
                take_home_amount,
                transaction_date
            FROM regular_agricultural_transaction 
            WHERE DATE(transaction_date) BETWEEN ? AND ?
            ORDER BY transaction_date DESC
        `;
        db.query(query, [startDate, endDate], callback);
    }

    // Get member reports with filtering options
    static getMemberReports(filters, callback) {
        let query = `
            SELECT 
                id,
                cb_number,
                first_name,
                middle_name,
                last_name,
                address,
                dob,
                email,
                gender,
                contact_number,
                beneficiaries,
                emergency_name,
                emergency_relationship,
                emergency_contact,
                date_issued,
                civil_status,
                age,
                place_of_birth,
                nationality,
                religion,
                occupation,
                annual_income,
                educational_attainment,
                membership_date,
                cooperative_position,
                agrarian_beneficiary,
                farm_area,
                farm_type
            FROM members 
            WHERE 1=1
        `;
        
        let queryParams = [];
        
        // Add filters based on provided parameters
        if (filters.startDate) {
            query += ' AND DATE(membership_date) >= ?';
            queryParams.push(filters.startDate);
        }
        
        if (filters.endDate) {
            query += ' AND DATE(membership_date) <= ?';
            queryParams.push(filters.endDate);
        }
        
        if (filters.gender && filters.gender !== 'all') {
            query += ' AND gender = ?';
            queryParams.push(filters.gender);
        }
        
        if (filters.agrarian && filters.agrarian !== 'all') {
            query += ' AND agrarian_beneficiary = ?';
            queryParams.push(filters.agrarian);
        }
        
        query += ' ORDER BY last_name, first_name';
        
        db.query(query, queryParams, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Export member reports to CSV
    static exportMemberReports(filters, callback) {
        let query = `
            SELECT 
                cb_number as "CB Number",
                CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name) as "Full Name",
                address as "Address",
                dob as "Date of Birth",
                email as "Email",
                gender as "Gender",
                contact_number as "Contact Number",
                beneficiaries as "Beneficiaries",
                emergency_name as "Emergency Contact",
                emergency_relationship as "Relationship",
                emergency_contact as "Emergency Phone",
                date_issued as "Date Issued",
                civil_status as "Civil Status",
                age as "Age",
                place_of_birth as "Place of Birth",
                nationality as "Nationality",
                religion as "Religion",
                occupation as "Occupation",
                annual_income as "Annual Income",
                educational_attainment as "Education",
                membership_date as "Membership Date",
                cooperative_position as "Position",
                agrarian_beneficiary as "Agrarian Beneficiary",
                farm_area as "Farm Area",
                farm_type as "Farm Type"
            FROM members 
            WHERE 1=1
        `;
        
        let queryParams = [];
        
        // Add filters based on provided parameters
        if (filters.startDate) {
            query += ' AND DATE(membership_date) >= ?';
            queryParams.push(filters.startDate);
        }
        
        if (filters.endDate) {
            query += ' AND DATE(membership_date) <= ?';
            queryParams.push(filters.endDate);
        }
        
        if (filters.gender && filters.gender !== 'all') {
            query += ' AND gender = ?';
            queryParams.push(filters.gender);
        }
        
        if (filters.agrarian && filters.agrarian !== 'all') {
            query += ' AND agrarian_beneficiary = ?';
            queryParams.push(filters.agrarian);
        }
        
        query += ' ORDER BY last_name, first_name';
        
        db.query(query, queryParams, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Get member statistics for dashboard
    static getMemberStatistics(callback) {
        const queries = {
            totalMembers: 'SELECT COUNT(*) as count FROM members',
            byGender: 'SELECT gender, COUNT(*) as count FROM members GROUP BY gender',
            byAgrarian: 'SELECT agrarian_beneficiary, COUNT(*) as count FROM members GROUP BY agrarian_beneficiary',
            newThisMonth: 'SELECT COUNT(*) as count FROM members WHERE MONTH(membership_date) = MONTH(CURDATE()) AND YEAR(membership_date) = YEAR(CURDATE())'
        };
        
        db.query(queries.totalMembers, (err, totalResult) => {
            if (err) return callback(err);
            
            db.query(queries.byGender, (err, genderResult) => {
                if (err) return callback(err);
                
                db.query(queries.byAgrarian, (err, agrarianResult) => {
                    if (err) return callback(err);
                    
                    db.query(queries.newThisMonth, (err, newMembersResult) => {
                        if (err) return callback(err);
                        
                        callback(null, {
                            total: totalResult[0].count,
                            byGender: genderResult,
                            byAgrarian: agrarianResult,
                            newThisMonth: newMembersResult[0].count
                        });
                    });
                });
            });
        });
    }
}

module.exports = Report;