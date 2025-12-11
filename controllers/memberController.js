const bcrypt = require('bcrypt');
const Member = require('../models/Member');
const db = require("../config/db");
const SalaryBonusLoan = require('../models/salaryBonusLoan');
const RegularAgriculturalLoan = require('../models/regularAgriculturalLoan');

// Helper function to calculate member savings based on admin dashboard logic
async function calculateMemberSavings(cb_number) {
    try {
        // Get savings data from transactions (similar to admin dashboard calculation)
        const [savingsData] = await db.promise().query(`
            SELECT 
                SUM(total_deductions) as total_deductions,
                SUM(total_or_amount) as total_or_amount
            FROM (
                SELECT total_deductions, total_or_amount FROM regular_agricultural_transaction WHERE cb_number = ?
                UNION ALL
                SELECT total_deductions, total_or_amount FROM salary_loan_transactions WHERE cb_number = ?
            ) as transactions
        `, [cb_number, cb_number]);

        const totalDeductions = parseFloat(savingsData[0].total_deductions) || 0;
        const totalOrAmount = parseFloat(savingsData[0].total_or_amount) || 0;
        
        // Calculate total savings from transactions
        const transactionSavings = totalDeductions + totalOrAmount;

        // Get additional savings from member_savings table if exists
        const [additionalSavings] = await db.promise().query(`
            SELECT additional_savings, monthly_increase 
            FROM member_savings 
            WHERE cb_number = ?
            ORDER BY created_at DESC 
            LIMIT 1
        `, [cb_number]);

        let additionalSavingsAmount = 0;
        let monthlyIncrease = 0;

        if (additionalSavings.length > 0) {
            additionalSavingsAmount = parseFloat(additionalSavings[0].additional_savings) || 0;
            monthlyIncrease = parseFloat(additionalSavings[0].monthly_increase) || 0;
        }

        // Total member savings = transaction savings + additional savings
        const memberTotalSavings = transactionSavings + additionalSavingsAmount;

        return {
            balance: memberTotalSavings,
            monthlyIncrease: monthlyIncrease,
            breakdown: {
                transactionSavings: transactionSavings,
                additionalSavings: additionalSavingsAmount,
                totalDeductions: totalDeductions,
                totalOrAmount: totalOrAmount
            }
        };
    } catch (error) {
        console.error('Error calculating member savings:', error);
        return { balance: 0, monthlyIncrease: 0, breakdown: {} };
    }
}

// Helper function to calculate remaining balance for a specific loan
async function calculateLoanRemainingBalance(loanId, loanType, cb_number) {
    try {
        // Get total loan amount
        let loanAmount = 0;
        
        if (loanType === 'Regular/Agricultural') {
            const [loan] = await db.promise().query(`
                SELECT loan_amount 
                FROM regular_agricultural_transaction 
                WHERE transaction_id = ? AND cb_number = ?
            `, [loanId, cb_number]);
            loanAmount = loan.length > 0 ? parseFloat(loan[0].loan_amount || 0) : 0;
        } else {
            const [loan] = await db.promise().query(`
                SELECT loan_amount 
                FROM salary_loan_transactions 
                WHERE id = ? AND cb_number = ?
            `, [loanId, cb_number]);
            loanAmount = loan.length > 0 ? parseFloat(loan[0].loan_amount || 0) : 0;
        }

        // Get total payments made for this specific loan
        const [payments] = await db.promise().query(`
            SELECT COALESCE(SUM(amount_paid), 0) as total_paid
            FROM loan_payments 
            WHERE loan_id = ? AND loan_type = ? AND cb_number = ? AND status = 'Completed'
        `, [loanId, loanType, cb_number]);

        const totalPaid = parseFloat(payments[0].total_paid || 0);
        
        return Math.max(0, loanAmount - totalPaid);
    } catch (error) {
        console.error('Error calculating loan remaining balance:', error);
        return 0;
    }
}

// Get Dashboard Data
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
        balanceLoan: 0,
        memberSavings: 0,
        monthlySavingsIncrease: 0,
        savingsBreakdown: {}
    };

    try {
        // Get Regular/Agricultural loans from transactions
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

        // Get Salary/Bonus loans from transactions
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
        
        // Calculate total loan amount
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

        // Calculate balance loan
        data.balanceLoan = Math.max(0, data.totalLoanAmount - data.amountPaid);

        // Calculate member savings
        const savingsData = await calculateMemberSavings(cb_number);
        data.memberSavings = savingsData.balance;
        data.monthlySavingsIncrease = savingsData.monthlyIncrease;
        data.savingsBreakdown = savingsData.breakdown;

        // Calculate next payment amount
        if (data.activeLoans.length > 0 && data.balanceLoan > 0) {
            const latestLoan = data.activeLoans[0];
            const loanRemainingBalance = await calculateLoanRemainingBalance(
                latestLoan.loan_id, 
                latestLoan.loan_type, 
                cb_number
            );
            
            if (loanRemainingBalance > 0) {
                let paymentsPerYear = 12;
                if (latestLoan.loan_type === 'Salary' || latestLoan.loan_type === 'Bonuses') {
                    paymentsPerYear = 24;
                }
                
                const remainingPayments = Math.min(paymentsPerYear, 12);
                data.nextPaymentAmount = Math.ceil(loanRemainingBalance / remainingPayments);
                
                const today = new Date();
                const nextPaymentDate = new Date(today);
                
                if (latestLoan.loan_type === 'Salary' || latestLoan.loan_type === 'Bonuses') {
                    nextPaymentDate.setDate(today.getDate() + 15);
                } else {
                    nextPaymentDate.setMonth(today.getMonth() + 1);
                    nextPaymentDate.setDate(15);
                }
                
                const timeDiff = nextPaymentDate.getTime() - today.getTime();
                data.daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                if (data.daysUntilDue < 0) {
                    data.daysUntilDue = 0;
                }
            }
        }

        return data;
    } catch (error) {
        console.error('Error in getDashboardData:', error);
        throw error;
    }
};

// Render Dashboard
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

// Get Savings Breakdown API
exports.getSavingsBreakdown = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.cb_number) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const cb_number = req.session.user.cb_number;
        const savingsData = await calculateMemberSavings(cb_number);

        res.json({
            success: true,
            data: {
                totalSavings: savingsData.balance,
                monthlyIncrease: savingsData.monthlyIncrease,
                breakdown: savingsData.breakdown
            }
        });
    } catch (error) {
        console.error('Error fetching savings breakdown:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch savings breakdown'
        });
    }
};

// Dashboard Data API
exports.getDashboardDataAPI = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.cb_number) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const dashboardData = await this.getDashboardData(req.session.user.cb_number);
        
        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard data'
        });
    }
};

// Render Change Password Page
exports.renderChangePasswordPage = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('member/change-password', { error: null, success: null });
};

// Update Password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user.id;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.render('member/change-password', { 
                error: "All fields are required.", 
                success: null 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render('member/change-password', { 
                error: "New passwords do not match.", 
                success: null 
            });
        }

        const member = await Member.findById(userId);
        if (!member) {
            return res.render('member/change-password', { 
                error: "User not found.", 
                success: null 
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, member.password);
        if (!isMatch) {
            return res.render('member/change-password', { 
                error: "Current password is incorrect.", 
                success: null 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Member.updatePassword(userId, hashedPassword);

        return res.render('member/change-password', { 
            error: null, 
            success: "Password updated successfully!" 
        });
    } catch (error) {
        console.error("Password change error:", error);
        return res.render('member/change-password', { 
            error: "Something went wrong! Please try again.", 
            success: null 
        });
    }
};

// Get Profile
exports.getProfile = async (req, res) => {
    if (!req.session.user || !req.session.user.cb_number) {
        return res.redirect('/login');
    }

    try {
        const cb_number = req.session.user.cb_number;
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

// Financial Forecast
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

        const dashboardData = await this.getDashboardData(member.cb_number);
        const hasOutstandingBalance = dashboardData.balanceLoan > 0;

        if (hasOutstandingBalance) {
            isEligible = false;
            reasons.push("You have outstanding loan balances that need to be settled.");
        }

        if (monthlySalary < 10000) {
            isEligible = false;
            reasons.push("Your monthly salary does not meet the minimum requirement.");
        }

        if (isEligible) {
            const totalObligations = dashboardData.balanceLoan;
            eligibleAmount = Math.max(0, (monthlySalary * 12 * 0.3) - totalObligations);
        }

        res.render('member/financial-forecast', {
            monthlySalary,
            loans,
            isEligible,
            eligibleAmount,
            reasons,
            user: req.session.user,
            balanceLoan: dashboardData.balanceLoan,
            memberSavings: dashboardData.memberSavings
        });

    } catch (err) {
        console.error(err);
        req.session.error_msg = 'Error retrieving financial forecast';
        res.redirect('/member/dashboard');
    }
};

module.exports = exports;