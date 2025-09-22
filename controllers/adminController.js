const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Member = require('../models/Member');
const Loan = require('../models/Loan');
const db = require('../config/db');

// Helper function to validate year format (YYYY or null)
const isValidYear = (year) => {
    if (!year) return true; // Allow null for nullable fields
    const yearNum = parseInt(year, 10);
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= new Date().getFullYear();
};

// Helper function to validate numeric fields
const isValidNumber = (value, allowNull = true) => {
    if (value === null || value === undefined || value === '') return allowNull;
    return !isNaN(parseFloat(value)) && isFinite(value);
};

exports.renderDashboard = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            console.log('Unauthorized access to dashboard, redirecting to login');
            return res.redirect('/login');
        }

        const dashboardData = {
            totalActiveLoans: 0,
            activeLoanCount: 0,
            totalMembers: 0,
            newMembersThisMonth: 0,
            pendingApplications: 0,
            totalSavings: 0,
            recentLoanApplications: [],
            recentActivities: []
        };

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.session.user,
            ...dashboardData
        });
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.status(500).render('error', { error: `Internal Server Error: ${error.message}` });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const [activeLoans] = await db.promise().query(`
            SELECT SUM(loan_amount) as total, COUNT(*) as count 
            FROM (
                SELECT loan_amount FROM salary_loan_transactions
                UNION ALL
                SELECT loan_amount FROM regular_agricultural_transaction
            ) as loans
        `);

        const [members] = await db.promise().query('SELECT COUNT(*) as count FROM members WHERE is_archived = FALSE');

        const [newMembers] = await db.promise().query(`
            SELECT COUNT(*) as count FROM members 
            WHERE MONTH(membership_date) = MONTH(CURRENT_DATE()) 
            AND YEAR(membership_date) = YEAR(CURRENT_DATE())
            AND is_archived = FALSE
        `);

        const [pendingApps] = await db.promise().query(`
            SELECT COUNT(*) as count FROM (
                SELECT application_no FROM regular_agricultural_loans WHERE application_status = 'Pending'
                UNION ALL
                SELECT application_no FROM salary_bonuses_loans WHERE application_status = 'Pending'
            ) as applications
        `);

        const [savingsData] = await db.promise().query(`
            SELECT 
                SUM(total_deductions) as total_deductions,
                SUM(total_or_amount) as total_or_amount
            FROM (
                SELECT total_deductions, total_or_amount FROM regular_agricultural_transaction
                UNION ALL
                SELECT total_deductions, total_or_amount FROM salary_loan_transactions
            ) as transactions
        `);

        const totalDeductions = parseFloat(savingsData[0].total_deductions) || 0;
        const totalOrAmount = parseFloat(savingsData[0].total_or_amount) || 0;
        const totalSavings = totalDeductions + totalOrAmount + 1500000;

        const [bayanihanSavings] = await db.promise().query(`
            SELECT SUM(bayanihan_savings) as total FROM (
                SELECT bayanihan_savings FROM regular_agricultural_transaction
                UNION ALL
                SELECT bayanihan_savings FROM salary_loan_transactions
            ) as savings
        `);

        const [recentLoans] = await db.promise().query(`
            (SELECT 
                cb_number, 
                'Salary Loan' as loan_type, 
                loan_amount, 
                transaction_date as application_date, 
                'Approved' as application_status,
                NULL as first_name,
                NULL as last_name
            FROM salary_loan_transactions
            ORDER BY transaction_date DESC
            LIMIT 5)
            UNION ALL
            (SELECT 
                cb_number, 
                'Regular Agricultural Loan' as loan_type, 
                loan_amount, 
                transaction_date as application_date, 
                'Approved' as application_status,
                NULL as first_name,
                NULL as last_name
            FROM regular_agricultural_transaction
            ORDER BY transaction_date DESC
            LIMIT 5)
            ORDER BY application_date DESC
            LIMIT 5
        `);

        const recentActivities = [
            {
                icon: '💰',
                iconBgColor: 'rgba(76, 175, 80, 0.15)',
                iconColor: '#4caf50',
                title: 'New Loan Approved',
                description: 'Recent loan application approved',
                time: '2h ago'
            },
            {
                icon: '👤',
                iconBgColor: 'rgba(33, 150, 243, 0.15)',
                iconColor: '#2196f3',
                title: 'New Member Registered',
                description: 'New member joined the cooperative',
                time: '5h ago'
            }
        ];

        const formatNumber = (num) => {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        res.json({
            totalActiveLoans: formatNumber(activeLoans[0].total || 0),
            activeLoanCount: activeLoans[0].count || 0,
            totalMembers: members[0].count || 0,
            newMembersThisMonth: newMembers[0].count || 0,
            pendingApplications: pendingApps[0].count || 0,
            totalSavings: formatNumber(totalSavings),
            totalBayanihanSavings: formatNumber(bayanihanSavings[0].total || 0),
            savingsIncreaseThisMonth: 0,
            recentLoanApplications: recentLoans,
            recentActivities
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: `Failed to fetch dashboard data: ${error.message}` });
    }
};

exports.renderRegisterPage = (req, res) => {
    if (!req.session?.user || req.session.user.role !== 'admin') {
        console.log('Unauthorized access to register page, redirecting to login');
        return res.redirect('/login');
    }
    res.render('admin/register', { error: null });
};

exports.registerMember = async (req, res) => {
    try {
        // Handle file upload
        let profilePicturePath = null;
        if (req.file) {
            profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
        }

        const {
            cb_number, password, role, first_name, middle_name, last_name,
            address, dob, email, gender, contact_number, beneficiaries,
            emergency_name, emergency_relationship, emergency_address,
            emergency_contact, date_issued, nickname, civil_status, age,
            place_of_birth, nationality, religion, spouse_name, spouse_age,
            spouse_occupation, father_name, mother_name, parent_address,
            number_of_children, children_info, educational_attainment,
            occupation, other_income, annual_income, elementary_school,
            elementary_address, elementary_year_graduated, secondary_school,
            secondary_address, secondary_year_graduated, college_school,
            college_address, college_year_graduated, vocational_school,
            vocational_address, vocational_year_graduated, membership_date,
            cooperative_position, emergency_contact_name, emergency_contact_address,
            relation, agrarian_beneficiary, farm_area, farm_type, is_tenant,
            recruited_by, signature, signed_date
        } = req.body;

        // Log request body and file for debugging
        console.log('Registering member with data:', { cb_number, first_name, last_name, email });
        console.log('Uploaded File:', req.file);

        // Validate required fields
        const requiredFields = {
            cb_number, first_name, last_name, address, dob, email, gender,
            contact_number, emergency_name, emergency_relationship, emergency_address,
            emergency_contact, password, role
        };
        const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
        if (missingFields.length > 0) {
            if (req.file) {
                const filePath = path.join(__dirname, '../public/uploads/profile-pictures', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(400).render('admin/register', {
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate data types
        const validationErrors = [];
        if (!isValidNumber(age)) validationErrors.push('Age must be a valid number');
        if (!isValidNumber(number_of_children)) validationErrors.push('Number of children must be a valid number');
        if (!isValidNumber(annual_income)) validationErrors.push('Annual income must be a valid number');
        if (!isValidNumber(farm_area)) validationErrors.push('Farm area must be a valid number');
        if (!isValidYear(elementary_year_graduated)) validationErrors.push('Elementary year graduated must be a valid year');
        if (!isValidYear(secondary_year_graduated)) validationErrors.push('Secondary year graduated must be a valid year');
        if (!isValidYear(college_year_graduated)) validationErrors.push('College year graduated must be a valid year');
        if (!isValidYear(vocational_year_graduated)) validationErrors.push('Vocational year graduated must be a valid year');
        if (!['Male', 'Female'].includes(gender)) validationErrors.push('Gender must be Male or Female');
        if (agrarian_beneficiary && !['Yes', 'No'].includes(agrarian_beneficiary)) {
            validationErrors.push('Agrarian beneficiary must be Yes or No');
        }
        if (farm_type && !['Irrigated', 'Rainfed'].includes(farm_type)) {
            validationErrors.push('Farm type must be Irrigated or Rainfed');
        }
        if (is_tenant && !['Yes', 'No'].includes(is_tenant)) {
            validationErrors.push('Is tenant must be Yes or No');
        }

        if (validationErrors.length > 0) {
            if (req.file) {
                const filePath = path.join(__dirname, '../public/uploads/profile-pictures', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(400).render('admin/register', {
                error: `Validation errors: ${validationErrors.join(', ')}`
            });
        }

        // Insert into users table
        const hashedPassword = await bcrypt.hash(password, 10);
        await new Promise((resolve, reject) => {
            User.create(cb_number, hashedPassword, role, (err) => {
                if (err) {
                    console.error('Error inserting into users table:', err);
                    if (req.file) {
                        const filePath = path.join(__dirname, '../public/uploads/profile-pictures', req.file.filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }
                    reject(new Error(`Failed to create user: ${err.message}`));
                } else {
                    resolve();
                }
            });
        });

        // Prepare values for members table
        const memberValues = [
            cb_number,
            first_name,
            middle_name || null,
            last_name,
            profilePicturePath || null,
            address,
            dob,
            email,
            gender,
            contact_number,
            JSON.stringify(beneficiaries || []) || null,
            emergency_name,
            emergency_relationship,
            emergency_address,
            emergency_contact,
            date_issued || null,
            nickname || null,
            civil_status || null,
            age ? parseInt(age) : null,
            place_of_birth || null,
            nationality || null,
            religion || null,
            spouse_name || null,
            spouse_age ? parseInt(spouse_age) : null,
            spouse_occupation || null,
            father_name || null,
            mother_name || null,
            parent_address || null,
            number_of_children ? parseInt(number_of_children) : null,
            children_info || null,
            educational_attainment || null,
            occupation || null,
            other_income || null,
            annual_income ? parseFloat(annual_income) : null,
            elementary_school || null,
            elementary_address || null,
            elementary_year_graduated || null,
            secondary_school || null,
            secondary_address || null,
            secondary_year_graduated || null,
            college_school || null,
            college_address || null,
            college_year_graduated || null,
            vocational_school || null,
            vocational_address || null,
            vocational_year_graduated || null,
            membership_date || null,
            cooperative_position || null,
            emergency_contact_name || null,
            emergency_contact_address || null,
            relation || null,
            agrarian_beneficiary || null,
            farm_area ? parseFloat(farm_area) : null,
            farm_type || null,
            is_tenant || null,
            recruited_by || null,
            signature || null,
            signed_date || null,
            0, // is_archived
            null // archived_at
        ];

        console.log('Member.create values:', memberValues);
        console.log('Number of values:', memberValues.length); // Should be 60

        // Verify the number of values
        if (memberValues.length !== 60) {
            throw new Error(`Expected 60 values for members table, but got ${memberValues.length}`);
        }

        // Insert into members table
        await new Promise((resolve, reject) => {
            Member.create(...memberValues, (err, result) => {
                if (err) {
                    console.error('Error inserting into members table:', err);
                    if (req.file) {
                        const filePath = path.join(__dirname, '../public/uploads/profile-pictures', req.file.filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }
                    reject(new Error(`Failed to create member: ${err.message}`));
                } else {
                    console.log('Member inserted successfully:', { cb_number });
                    resolve(result);
                }
            });
        });

        console.log('Redirecting to /admin/members-list');
        res.redirect('/admin/members-list'); // Fixed redirect to match defined route
    } catch (error) {
        console.error('Registration error:', error);
        if (req.file) {
            const filePath = path.join(__dirname, '../public/uploads/profile-pictures', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.status(500).render('admin/register', {
            error: `Registration failed: ${error.message}`
        });
    }
};

exports.renderChangePasswordPage = (req, res) => {
    if (!req.session?.user || req.session.user.role !== 'admin') {
        console.log('Unauthorized access to change password page, redirecting to login');
        return res.redirect('/login');
    }
    res.render('admin/change-password', { error: null, success: null });
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user.cb_number;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.render('admin/change-password', {
                error: 'All password fields are required',
                success: null
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render('admin/change-password', {
                error: 'New passwords do not match',
                success: null
            });
        }

        const user = await new Promise((resolve, reject) => {
            User.findByUserId(userId, (err, user) => {
                if (err) reject(new Error(`Database error: ${err.message}`));
                resolve(user);
            });
        });

        if (!user) {
            return res.render('admin/change-password', {
                error: 'User not found',
                success: null
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.render('admin/change-password', {
                error: 'Current password is incorrect',
                success: null
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await new Promise((resolve, reject) => {
            User.updatePassword(userId, hashedPassword, (err) => {
                if (err) reject(new Error(`Failed to update password: ${err.message}`));
                resolve();
            });
        });

        res.render('admin/change-password', {
            error: null,
            success: 'Password updated successfully!'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.render('admin/change-password', {
            error: `Something went wrong: ${error.message}`,
            success: null
        });
    }
};

exports.renderMembersList = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            console.log('Unauthorized access to members list, redirecting to login');
            return res.redirect('/login');
        }

        if (typeof Member.getAllMembers !== 'function') {
            console.error('❌ Member.getAllMembers is not defined.');
            throw new Error('Member.getAllMembers is not defined');
        }

        const members = await new Promise((resolve, reject) => {
            Member.getAllMembers((err, results) => {
                if (err) {
                    console.error('Error fetching members:', err);
                    reject(new Error(`Failed to fetch members: ${err.message}`));
                }
                resolve(results || []);
            });
        });

        console.log('Fetched members:', members.length, 'records');
        res.render('admin/members-list', { members, error: null });
    } catch (error) {
        console.error('Error rendering members list:', error);
        res.status(500).render('admin/members-list', {
            members: [],
            error: `Failed to fetch members: ${error.message}`
        });
    }
};

exports.updateMember = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const memberData = req.body;
        const cbNumber = memberData.cb_number;

        if (!cbNumber) {
            return res.status(400).json({ success: false, message: 'CB Number is required' });
        }

        // Validate data types for numeric and enum fields
        const validationErrors = [];
        if (memberData.age && !isValidNumber(memberData.age)) validationErrors.push('Age must be a valid number');
        if (memberData.number_of_children && !isValidNumber(memberData.number_of_children)) {
            validationErrors.push('Number of children must be a valid number');
        }
        if (memberData.annual_income && !isValidNumber(memberData.annual_income)) {
            validationErrors.push('Annual income must be a valid number');
        }
        if (memberData.farm_area && !isValidNumber(memberData.farm_area)) {
            validationErrors.push('Farm area must be a valid number');
        }
        if (memberData.elementary_year_graduated && !isValidYear(memberData.elementary_year_graduated)) {
            validationErrors.push('Elementary year graduated must be a valid year');
        }
        if (memberData.secondary_year_graduated && !isValidYear(memberData.secondary_year_graduated)) {
            validationErrors.push('Secondary year graduated must be a valid year');
        }
        if (memberData.college_year_graduated && !isValidYear(memberData.college_year_graduated)) {
            validationErrors.push('College year graduated must be a valid year');
        }
        if (memberData.vocational_year_graduated && !isValidYear(memberData.vocational_year_graduated)) {
            validationErrors.push('Vocational year graduated must be a valid year');
        }
        if (memberData.gender && !['Male', 'Female'].includes(memberData.gender)) {
            validationErrors.push('Gender must be Male or Female');
        }
        if (memberData.agrarian_beneficiary && !['Yes', 'No'].includes(memberData.agrarian_beneficiary)) {
            validationErrors.push('Agrarian beneficiary must be Yes or No');
        }
        if (memberData.farm_type && !['Irrigated', 'Rainfed'].includes(memberData.farm_type)) {
            validationErrors.push('Farm type must be Irrigated or Rainfed');
        }
        if (memberData.is_tenant && !['Yes', 'No'].includes(memberData.is_tenant)) {
            validationErrors.push('Is tenant must be Yes or No');
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Validation errors: ${validationErrors.join(', ')}`
            });
        }

        await new Promise((resolve, reject) => {
            Member.updateByCbNumber(cbNumber, memberData, (err, result) => {
                if (err) {
                    console.error('Error updating member:', err);
                    reject(new Error(`Failed to update member: ${err.message}`));
                } else if (result.affectedRows === 0) {
                    reject(new Error('Member not found'));
                } else {
                    resolve();
                }
            });
        });

        res.json({ success: true, message: 'Member updated successfully' });
    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({
            success: false,
            message: `Error updating member: ${error.message}`
        });
    }
};

exports.archiveMember = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { cbNumber } = req.params;

        if (!cbNumber) {
            return res.status(400).json({ success: false, message: 'CB Number is required' });
        }

        await new Promise((resolve, reject) => {
            Member.archiveByCbNumber(cbNumber, (err, result) => {
                if (err) {
                    console.error('Error archiving member:', err);
                    reject(new Error(`Failed to archive member: ${err.message}`));
                } else if (result.affectedRows === 0) {
                    reject(new Error('Member not found'));
                } else {
                    resolve();
                }
            });
        });

        res.json({ success: true, message: 'Member archived successfully' });
    } catch (error) {
        console.error('Archive member error:', error);
        res.status(500).json({
            success: false,
            message: `Error archiving member: ${error.message}`
        });
    }
};

exports.restoreMember = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { cbNumber } = req.params;

        if (!cbNumber) {
            return res.status(400).json({ success: false, message: 'CB Number is required' });
        }

        await new Promise((resolve, reject) => {
            Member.restoreByCbNumber(cbNumber, (err, result) => {
                if (err) {
                    console.error('Error restoring member:', err);
                    reject(new Error(`Failed to restore member: ${err.message}`));
                } else if (result.affectedRows === 0) {
                    reject(new Error('Member not found'));
                } else {
                    resolve();
                }
            });
        });

        res.json({ success: true, message: 'Member restored successfully' });
    } catch (error) {
        console.error('Restore member error:', error);
        res.status(500).json({
            success: false,
            message: `Error restoring member: ${error.message}`
        });
    }
};

exports.getArchivedMembers = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const members = await new Promise((resolve, reject) => {
            Member.getArchivedMembers((err, results) => {
                if (err) {
                    console.error('Error fetching archived members:', err);
                    reject(new Error(`Failed to fetch archived members: ${err.message}`));
                } else {
                    resolve(results || []);
                }
            });
        });

        res.json({ success: true, members });
    } catch (error) {
        console.error('Error fetching archived members:', error);
        res.status(500).json({
            success: false,
            message: `Error fetching archived members: ${error.message}`
        });
    }
};

exports.renderRegularLoanForm = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            console.log('Unauthorized access to regular loan form, redirecting to login');
            return res.redirect('/login');
        }

        const cbNumber = req.query.cbNumber;
        let loan = {};

        if (cbNumber) {
            loan = await new Promise((resolve, reject) => {
                Loan.getRegularAgriculturalLoanByCbNumber(cbNumber, (err, result) => {
                    if (err) reject(new Error(`Failed to fetch loan: ${err.message}`));
                    resolve(result || {});
                });
            });
        }

        res.render('admin/loan-regular', {
            currentPage: 'loan-applications',
            cbNumber: cbNumber || '',
            loan,
            error: null
        });
    } catch (error) {
        console.error('Error rendering regular loan form:', error);
        res.render('admin/loan-regular', {
            currentPage: 'loan-applications',
            cbNumber: req.query.cbNumber || '',
            loan: {},
            error: `Error loading form: ${error.message}`
        });
    }
};

exports.renderLoanSalaryBonuses = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            console.log('Unauthorized access to salary/bonuses loan form, redirecting to login');
            return res.redirect('/login');
        }

        const cbNumber = req.query.cbNumber;
        let loan = {};

        if (cbNumber) {
            loan = await new Promise((resolve, reject) => {
                Loan.getSalaryBonusLoanByCbNumber(cbNumber, (err, result) => {
                    if (err) reject(new Error(`Failed to fetch loan: ${err.message}`));
                    resolve(result || {});
                });
            });
        }

        res.render('admin/loan-salary_bonuses', {
            currentPage: 'loan-applications',
            cbNumber: cbNumber || '',
            loan,
            error: null
        });
    } catch (error) {
        console.error('Error rendering salary/bonuses loan form:', error);
        res.render('admin/loan-salary_bonuses', {
            currentPage: 'loan-applications',
            cbNumber: req.query.cbNumber || '',
            loan: {},
            error: `Error loading form: ${error.message}`
        });
    }
};

exports.getRegularLoans = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            console.log('Unauthorized access to regular loans, redirecting to login');
            return res.redirect('/login');
        }

        const loans = await new Promise((resolve, reject) => {
            Loan.getAllRegularLoans((err, loans) => {
                if (err) reject(new Error(`Failed to fetch regular loans: ${err.message}`));
                resolve(loans || []);
            });
        });

        res.render('admin/regular_agricultural_loans', { loans, error: null });
    } catch (error) {
        console.error('Error fetching regular loans:', error);
        res.render('admin/regular_agricultural_loans', {
            loans: [],
            error: `Server error: ${error.message}`
        });
    }
};

exports.getSalaryBonusesLoans = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            console.log('Unauthorized access to salary/bonuses loans, redirecting to login');
            return res.redirect('/login');
        }

        const loans = await new Promise((resolve, reject) => {
            Loan.getAllSalaryBonusLoans((err, loans) => {
                if (err) reject(new Error(`Failed to fetch salary/bonuses loans: ${err.message}`));
                resolve(loans || []);
            });
        });

        res.render('admin/salary_bonuses_loans', { loans, error: null });
    } catch (error) {
        console.error('Error fetching salary/bonuses loans:', error);
        res.render('admin/salary_bonuses_loans', {
            loans: [],
            error: `Server error: ${error.message}`
        });
    }
};

exports.submitSalaryBonusLoan = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const {
            cbNumber, loanType, loanAmount, previousBalance, newBalance, serviceFee,
            processingFee, totalDeductions, totalLoanReceived, loanApplicationType,
            memberFee, shareCapital, bayanihanSavings, bonusType, midYearAmount,
            yearEndAmount, midYearInterest, yearEndInterest, totalInterest, cbu,
            interestFee, totalOrAmount, takeHomeAmount, submit
        } = req.body;

        if (!cbNumber || !isValidNumber(loanAmount, false) || !isValidNumber(previousBalance, false)) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid required fields (CB Number, Loan Amount, or Previous Balance)'
            });
        }

        const transactionData = {
            cb_number: cbNumber,
            loan_type: loanType,
            loan_amount: parseFloat(loanAmount) || 0,
            previous_balance: parseFloat(previousBalance) || 0,
            new_balance: parseFloat(newBalance) || 0,
            service_fee: parseFloat(serviceFee) || 0,
            processing_fee: parseFloat(processingFee) || 0,
            total_deductions: parseFloat(totalDeductions) || 0,
            total_loan_received: parseFloat(totalLoanReceived) || 0,
            total_or_amount: parseFloat(totalOrAmount) || 0,
            take_home_amount: parseFloat(takeHomeAmount) || 0,
            ...(loanType === 'salary' ? {
                loan_application_type: loanApplicationType,
                member_fee: parseFloat(memberFee) || 0,
                share_capital: parseFloat(shareCapital) || 0,
                bayanihan_savings: parseFloat(bayanihanSavings) || 0
            } : {
                bonus_type: bonusType,
                mid_year_amount: parseFloat(midYearAmount) || null,
                year_end_amount: parseFloat(yearEndAmount) || null,
                mid_year_interest: parseFloat(midYearInterest) || null,
                year_end_interest: parseFloat(yearEndInterest) || null,
                total_interest: parseFloat(totalInterest) || null,
                cbu: parseFloat(cbu) || 0,
                interest_fee: parseFloat(interestFee) || null
            })
        };

        const transactionResult = await new Promise((resolve, reject) => {
            Loan.getSalaryBonusTransaction(cbNumber, (err, existingTransaction) => {
                if (err) {
                    console.error('Error checking existing transaction:', err);
                    reject(new Error(`Failed to check existing transaction: ${err.message}`));
                } else if (existingTransaction) {
                    Loan.updateSalaryBonusTransaction(transactionData, (err) => {
                        if (err) {
                            console.error('Error updating transaction:', err);
                            reject(new Error(`Failed to update transaction: ${err.message}`));
                        } else {
                            resolve('Transaction updated successfully');
                        }
                    });
                } else {
                    Loan.createSalaryBonusTransaction(transactionData, (err) => {
                        if (err) {
                            console.error('Error creating transaction:', err);
                            reject(new Error(`Failed to create transaction: ${err.message}`));
                        } else {
                            resolve('Transaction created successfully');
                        }
                    });
                }
            });
        });

        const statusResult = submit ? await new Promise((resolve, reject) => {
            Loan.updateLoanApplicationStatus(cbNumber, 'Approved', (err) => {
                if (err) {
                    console.error('Error updating loan status:', err);
                    reject(new Error(`Failed to update loan status: ${err.message}`));
                } else {
                    resolve('Loan approved successfully');
                }
            });
        }) : 'No status update required';

        res.json({
            success: true,
            message: `${transactionResult}. ${statusResult}`,
            action: 'submitted'
        });
    } catch (error) {
        console.error('Error processing salary/bonus loan:', error);
        res.status(500).json({
            success: false,
            message: `Error processing loan: ${error.message}`
        });
    }
};

exports.saveRegularAgriculturalLoan = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const {
            cb_number, property_value, max_loan_amount, loan_application_type,
            loan_amount, previous_balance, new_balance, service_fee, processing_fee,
            total_deductions, total_loan_received, member_fee, share_capital,
            bayanihan_savings, advance_interest, total_or_amount, take_home_amount, submit
        } = req.body;

        if (!cb_number || !isValidNumber(loan_amount, false) || !isValidNumber(property_value, false)) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid required fields (CB Number, Loan Amount, or Property Value)'
            });
        }

        const transactionData = {
            cb_number,
            property_value: parseFloat(property_value) || 0,
            max_loan_amount: parseFloat(max_loan_amount) || 0,
            loan_application_type,
            loan_amount: parseFloat(loan_amount) || 0,
            previous_balance: parseFloat(previous_balance) || 0,
            new_balance: parseFloat(new_balance) || 0,
            service_fee: parseFloat(service_fee) || 0,
            processing_fee: parseFloat(processing_fee) || 0,
            total_deductions: parseFloat(total_deductions) || 0,
            total_loan_received: parseFloat(total_loan_received) || 0,
            member_fee: parseFloat(member_fee) || 0,
            share_capital: parseFloat(share_capital) || 0,
            bayanihan_savings: parseFloat(bayanihan_savings) || 0,
            advance_interest: parseFloat(advance_interest) || 0,
            total_or_amount: parseFloat(total_or_amount) || 0,
            take_home_amount: parseFloat(take_home_amount) || 0
        };

        const transactionResult = await new Promise((resolve, reject) => {
            Loan.getRegularAgriculturalTransaction(cb_number, (err, existingTransaction) => {
                if (err) {
                    console.error('Error checking existing transaction:', err);
                    reject(new Error(`Failed to check existing transaction: ${err.message}`));
                } else if (existingTransaction) {
                    Loan.updateRegularAgriculturalTransaction(transactionData, (err) => {
                        if (err) {
                            console.error('Error updating transaction:', err);
                            reject(new Error(`Failed to update transaction: ${err.message}`));
                        } else {
                            resolve('Transaction updated successfully');
                        }
                    });
                } else {
                    Loan.createRegularAgriculturalTransaction(transactionData, (err) => {
                        if (err) {
                            console.error('Error creating transaction:', err);
                            reject(new Error(`Failed to create transaction: ${err.message}`));
                        } else {
                            resolve('Transaction created successfully');
                        }
                    });
                }
            });
        });

        const statusResult = submit ? await new Promise((resolve, reject) => {
            Loan.updateLoanApplicationStatus(cb_number, 'Approved', (err) => {
                if (err) {
                    console.error('Error updating loan status:', err);
                    reject(new Error(`Failed to update loan status: ${err.message}`));
                } else {
                    resolve('Loan approved successfully');
                }
            });
        }) : 'Saved without approval';

        res.json({
            success: true,
            message: `${transactionResult}. ${statusResult}`,
            action: submit ? 'approved' : 'saved'
        });
    } catch (error) {
        console.error('Error processing regular agricultural loan:', error);
        res.status(500).json({
            success: false,
            message: `Error processing loan: ${error.message}`
        });
    }
};

exports.getLoanReleases = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'admin') {
            console.log('Unauthorized access to loan releases, redirecting to login');
            return res.redirect('/login');
        }

        const [regularLoans, salaryLoans] = await Promise.all([
            new Promise((resolve, reject) => {
                Loan.getAllRegularLoanReleases((err, results) => {
                    if (err) reject(new Error(`Failed to fetch regular loan releases: ${err.message}`));
                    resolve(results || []);
                });
            }),
            new Promise((resolve, reject) => {
                Loan.getAllSalaryLoanReleases((err, results) => {
                    if (err) reject(new Error(`Failed to fetch salary loan releases: ${err.message}`));
                    resolve(results || []);
                });
            })
        ]);

        const allLoans = [...regularLoans, ...salaryLoans];
        res.render('admin/loan-releases', { loans: allLoans, error: null });
    } catch (error) {
        console.error('Error fetching loan releases:', error);
        res.render('admin/loan-releases', {
            loans: [],
            error: `Internal Server Error: ${error.message}`
        });
    }
};

module.exports = exports;