const bcrypt = require('bcrypt');
const Member = require('../models/Member'); // Ensure this model has the correct methods
const db = require("../config/db");
const SalaryBonusLoan = require('../models/salaryBonusLoan');
const RegularAgriculturalLoan = require('../models/regularAgriculturalLoan');

// Render the change password page
exports.renderChangePasswordPage = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('member/change-password', { error: null, success: null });
};

// Handle password update
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user.id; // Use ID instead of cb_number

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.render('member/change-password', { error: "All fields are required.", success: null });
        }

        if (newPassword !== confirmPassword) {
            return res.render('member/change-password', { error: "New passwords do not match.", success: null });
        }

        const member = await Member.findById(userId); // Find by ID
        if (!member) {
            return res.render('member/change-password', { error: "User not found.", success: null });
        }

        // Compare current password with stored hashed password
        const isMatch = await bcrypt.compare(currentPassword, member.password);
        if (!isMatch) {
            return res.render('member/change-password', { error: "Current password is incorrect.", success: null });
        }

        // Hash new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Member.updatePassword(userId, hashedPassword); // Update password

        return res.render('member/change-password', { error: null, success: "Password updated successfully!" });
    } catch (error) {
        console.error("Password change error:", error);
        return res.render('member/change-password', { error: "Something went wrong! Please try again.", success: null });
    }
};

// Get Profile
exports.getProfile = async (req, res) => {
    console.log("Session Data:", req.session);

    if (!req.session.user || !req.session.user.cb_number) {
        console.log("User not logged in, redirecting to /login");
        return res.redirect('/login');
    }

    try {
        const cb_number = req.session.user.cb_number;
        console.log("Fetching profile for CB Number:", cb_number);

        const [member] = await Member.findByCbNumber(cb_number);

        if (!member) {
            return res.status(404).send('Member not found');
        }

        res.render('member/profile', { member });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).send('Server Error');
    }
};

// Updated getDashboardData method for memberController.js
exports.getDashboardData = async (cb_number) => {
    const data = {
        activeLoans: [],
        totalLoanAmount: 0,
        activeLoanType: 'No active loan',
        paymentHistory: [],
        amountPaid: 0,
        paymentPercentage: 0,
        nextPaymentAmount: 0,
        daysUntilDue: 0,
        savingsBalance: 0,
        monthlySavingsIncrease: 0
    };

    try {
        // Get Regular/Agricultural loans from transactions (approved loans)
        const [regularLoans] = await db.promise().query(`
            SELECT 
                transaction_id as loan_id,
                cb_number,
                'Regular/Agricultural' as loan_type,
                loan_amount,
                'APPROVED' as application_status,
                service_fee,
                processing_fee,
                total_deductions,
                total_loan_received,
                take_home_amount,
                transaction_date,
                loan_application_type
            FROM regular_agricultural_transaction 
            WHERE cb_number = ?
            ORDER BY transaction_date DESC
        `, [cb_number]);

        // Get Salary/Bonus loans from transactions (approved loans)
        const [salaryBonusLoans] = await db.promise().query(`
            SELECT 
                id as loan_id,
                cb_number,
                CASE 
                    WHEN loan_type = 'salary' THEN 'Salary'
                    WHEN loan_type = 'bonuses' THEN 'Bonuses'
                    ELSE loan_type
                END as loan_type,
                loan_amount,
                'APPROVED' as application_status,
                service_fee,
                processing_fee,
                total_deductions,
                total_loan_received,
                take_home_amount,
                transaction_date,
                loan_application_type
            FROM salary_loan_transactions 
            WHERE cb_number = ?
            ORDER BY transaction_date DESC
        `, [cb_number]);
        
        // Combine all active loans
        data.activeLoans = [...regularLoans, ...salaryBonusLoans];
        
        // Calculate total loan amount from all active loans
        data.totalLoanAmount = data.activeLoans.reduce((sum, loan) => {
            return sum + parseFloat(loan.loan_amount || 0);
        }, 0);
        
        // Set active loan type
        if (data.activeLoans.length > 0) {
            data.activeLoanType = data.activeLoans[0].loan_type;
        }

        // Get payment history
        const [payments] = await db.promise().query(`
            SELECT 
                lp.*,
                DATE_FORMAT(lp.payment_date, '%Y-%m-%d') as formatted_date
            FROM loan_payments lp
            WHERE lp.cb_number = ? 
            ORDER BY lp.payment_date DESC 
            LIMIT 5
        `, [cb_number]);
        
        data.paymentHistory = payments.map(payment => ({
            ...payment,
            payment_date: payment.payment_date,
            amount: payment.amount_paid,
            payment_type: payment.loan_type,
            status: payment.status
        }));

        // Calculate total amount paid
        const [totalPaidResult] = await db.promise().query(`
            SELECT COALESCE(SUM(amount_paid), 0) as total_paid
            FROM loan_payments 
            WHERE cb_number = ? AND status = 'Completed'
        `, [cb_number]);
        
        data.amountPaid = parseFloat(totalPaidResult[0].total_paid || 0);
        
        // Calculate payment percentage
        if (data.totalLoanAmount > 0) {
            data.paymentPercentage = Math.round((data.amountPaid / data.totalLoanAmount) * 100);
        }

        // Calculate next payment amount (example calculation)
        if (data.activeLoans.length > 0) {
            // This is a simplified calculation - you may want to implement
            // more complex loan payment scheduling logic
            const latestLoan = data.activeLoans[0];
            const remainingBalance = parseFloat(latestLoan.loan_amount) - data.amountPaid;
            
            if (remainingBalance > 0) {
                // Assume monthly payments over 12 months (adjust as needed)
                data.nextPaymentAmount = Math.ceil(remainingBalance / 12);
                
                // Calculate days until next payment due
                // Assuming payments are due on the same day each month
                const today = new Date();
                const nextPaymentDate = new Date(today);
                nextPaymentDate.setMonth(today.getMonth() + 1);
                nextPaymentDate.setDate(15); // Assuming payments due on 15th of each month
                
                const timeDiff = nextPaymentDate.getTime() - today.getTime();
                data.daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
            }
        }

        // Get savings balance (you may need to create this table)
        try {
            const [savingsResult] = await db.promise().query(`
                SELECT balance, monthly_increase 
                FROM member_savings 
                WHERE cb_number = ?
                ORDER BY created_at DESC 
                LIMIT 1
            `, [cb_number]);
            
            if (savingsResult.length > 0) {
                data.savingsBalance = parseFloat(savingsResult[0].balance || 0);
                data.monthlySavingsIncrease = parseFloat(savingsResult[0].monthly_increase || 0);
            }
        } catch (savingsError) {
            // Table might not exist, use defaults
            console.log('Member savings table not found, using defaults');
            data.savingsBalance = 0;
            data.monthlySavingsIncrease = 0;
        }

        return data;
    } catch (error) {
        console.error('Error in getDashboardData:', error);
        throw error;
    }
};

exports.getDashboard = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.cb_number) {
            return res.redirect('/login');
        }

        const user = req.session.user;
        const dashboardData = await this.getDashboardData(user.cb_number);

        res.render('member/dashboard', {
            title: 'Member Dashboard',
            user: user,
            ...dashboardData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('member/dashboard', {
            title: 'Member Dashboard',
            user: req.session.user,
            error: 'Failed to load dashboard data'
        });
    }
};

// Financial Forecast Controller
exports.getFinancialForecast = async (req, res) => {
    try {
        const [member] = await Member.findByCbNumber(req.session.user.cb_number);
        
        if (!member) {
            req.session.error_msg = 'Member not found';
            return res.redirect('/member/dashboard');
        }

        const salaryLoan = await SalaryBonusLoan.findOneByCbNumber(member.cb_number);
        const monthlySalary = salaryLoan ? salaryLoan.basic_monthly_salary || 0 : 0;

        const regularLoans = await RegularAgriculturalLoan.findAllByCbNumber(member.cb_number);
        const salaryLoans = await SalaryBonusLoan.findAllByCbNumber(member.cb_number);

        const loans = [...regularLoans, ...salaryLoans];

        let isEligible = true;
        let reasons = [];
        let eligibleAmount = 0;

        const hasOutstandingBalance = loans.some(loan => 
            loan.outstanding_balance && loan.outstanding_balance > 0 && 
            ['With O/B Balance', 'Past Due'].includes(loan.loan_status)
        );

        if (hasOutstandingBalance) {
            isEligible = false;
            reasons.push("You have outstanding loan balances that need to be settled.");
        }

        if (monthlySalary < 10000) {
            isEligible = false;
            reasons.push("Your monthly salary does not meet the minimum requirement.");
        }

        if (isEligible) {
            const totalObligations = loans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0);
            eligibleAmount = Math.max(0, (monthlySalary * 12 * 0.3) - totalObligations);
        }

        res.render('member/financial-forecast', {
            monthlySalary,
            loans,
            isEligible,
            eligibleAmount,
            reasons,
            user: req.session.user
        });

    } catch (err) {
        console.error(err);
        req.session.error_msg = 'Error retrieving financial forecast';
        res.redirect('/member/dashboard');
    }
};
