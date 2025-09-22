// controllers/riskController.js
const RiskAssessment = require('../models/riskAssessment');
const db = require('../config/db'); // Your database connection

class RiskController {
    static assessSalaryLoanRisk(applicationNo) {
        return new Promise((resolve, reject) => {
            db.query(`
                SELECT * FROM salary_bonuses_loans 
                WHERE application_no = ?
            `, [applicationNo], (error, results) => {
                if (error) return reject(error);
                if (!results || results.length === 0) return reject(new Error('Loan not found'));
                
                const riskLevel = RiskAssessment.assessSalaryLoan(results[0]);
                resolve({ 
                    applicationNo,
                    riskLevel,
                    details: results[0]
                });
            });
        });
    }

    static assessAgriculturalLoanRisk(applicationNo) {
        return new Promise((resolve, reject) => {
            db.query(`
                SELECT * FROM regular_agricultural_loans 
                WHERE application_no = ?
            `, [applicationNo], (error, results) => {
                if (error) return reject(error);
                if (!results || results.length === 0) return reject(new Error('Loan not found'));
                
                const riskLevel = RiskAssessment.assessAgriculturalLoan(results[0]);
                resolve({ 
                    applicationNo,
                    riskLevel,
                    details: results[0]
                });
            });
        });
    }

    static getAllHighRiskLoans() {
        return new Promise((resolve, reject) => {
            // First query for salary loans
            db.query('SELECT * FROM salary_bonuses_loans', (error1, salaryLoans) => {
                if (error1) return reject(error1);
                
                // Then query for agricultural loans
                db.query('SELECT * FROM regular_agricultural_loans', (error2, agriLoans) => {
                    if (error2) return reject(error2);
                    
                    const highRiskLoans = [];
                    
                    salaryLoans.forEach(loan => {
                        const riskLevel = RiskAssessment.assessSalaryLoan(loan);
                        if (riskLevel === 'High') {
                            highRiskLoans.push({
                                type: 'salary',
                                applicationNo: loan.application_no,
                                riskLevel,
                                details: loan
                            });
                        }
                    });
                    
                    agriLoans.forEach(loan => {
                        const riskLevel = RiskAssessment.assessAgriculturalLoan(loan);
                        if (riskLevel === 'High') {
                            highRiskLoans.push({
                                type: 'agricultural',
                                applicationNo: loan.application_no,
                                riskLevel,
                                details: loan
                            });
                        }
                    });
                    
                    resolve(highRiskLoans);
                });
            });
        });
    }
}

module.exports = RiskController;