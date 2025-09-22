// clerkController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const Member = require('../models/Member'); // Import the Member model
const User = require('../models/User'); // Import User model

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

module.exports = {
    showDashboard: async (req, res) => {
        try {
            res.render('clerk/dashboard', {
                title: 'Clerk Dashboard',
                currentPage: 'dashboard',
                user: req.session.user
            });
        } catch (err) {
            console.error('Clerk Dashboard error:', err);
            res.status(500).render('error', {
                message: 'Failed to load clerk dashboard'
            });
        }
    },

    getDashboardData: async (req, res) => {
        try {
            const [[{ totalMembers }]] = await db.promise().query(
                'SELECT COUNT(*) as totalMembers FROM members WHERE is_archived = FALSE'
            );

            const [[{ newMembersThisMonth }]] = await db.promise().query(`
                SELECT COUNT(*) as newMembersThisMonth FROM members
                WHERE MONTH(membership_date) = MONTH(CURRENT_DATE())
                AND YEAR(membership_date) = YEAR(CURRENT_DATE())
                AND is_archived = FALSE
            `);

            const [[{ recentRegistrations }]] = await db.promise().query(`
                SELECT COUNT(*) as recentRegistrations FROM members
                WHERE membership_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                AND is_archived = FALSE
            `);

            res.json({
                success: true,
                totalMembers,
                newMembersThisMonth,
                recentRegistrations
            });
        } catch (err) {
            console.error('Clerk Dashboard data error:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch clerk dashboard data'
            });
        }
    },

    getRecentMembers: async (req, res) => {
        try {
            const [members] = await db.promise().query(`
                SELECT cb_number, first_name, last_name, membership_date
                FROM members
                WHERE membership_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                AND is_archived = FALSE
                ORDER BY membership_date DESC
                LIMIT 5
            `);
            res.json({
                success: true,
                members
            });
        } catch (err) {
            console.error('Recent members error:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recent members'
            });
        }
    },

    showRegisterForm: (req, res) => {
        try {
            if (!req.session?.user || req.session.user.role !== 'clerk') {
                console.log('Unauthorized access to register page, redirecting to login');
                return res.redirect('/login');
            }
            res.render('clerk/register', {
                title: 'Register Member',
                currentPage: 'register',
                user: req.session.user,
                error: null // Initialize error as null
            });
        } catch (err) {
            console.error('Clerk Registration form error:', err);
            res.status(500).render('error', {
                message: 'Failed to load registration form'
            });
        }
    },

    registerMember: async (req, res) => {
        try {
            console.log('📌 POST request to /clerk/register');
            console.log('req.user set in middleware:', req.user);
            
            // Handle file upload
            let profilePicturePath = null;
            if (req.file) {
                profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
            }
            
            // Log the request body to debug
            console.log('Request body keys:', Object.keys(req.body));
            console.log('Password field:', req.body.password ? 'exists' : 'missing');
            
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

            // Validate required fields
            const requiredFields = {
                cb_number, first_name, last_name, address, dob, email, gender,
                contact_number, emergency_name, emergency_relationship, emergency_address,
                emergency_contact, password
            };
            
            const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
            if (missingFields.length > 0) {
                if (req.file) {
                    const filePath = path.join(__dirname, '../public/uploads/profile-pictures', req.file.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                return res.status(400).render('clerk/register', {
                    title: 'Register Member',
                    currentPage: 'register',
                    user: req.session.user,
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
                return res.status(400).render('clerk/register', {
                    title: 'Register Member',
                    currentPage: 'register',
                    user: req.session.user,
                    error: `Validation errors: ${validationErrors.join(', ')}`
                });
            }

            // Check if member already exists
            const existingMember = await Member.findByCbNumber(cb_number);
            if (existingMember && existingMember.length > 0) {
                if (req.file) {
                    const filePath = path.join(__dirname, '../public/uploads/profile-pictures', req.file.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                return res.status(400).render('clerk/register', {
                    title: 'Register Member',
                    currentPage: 'register',
                    user: req.session.user,
                    error: 'Member with this CB Number already exists'
                });
            }

            // Hash the password - this is where the error was occurring
            console.log('About to hash password:', password ? 'password exists' : 'password is undefined');
            if (!password || password.trim() === '') {
                if (req.file) {
                    const filePath = path.join(__dirname, '../public/uploads/profile-pictures', req.file.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                return res.status(400).render('clerk/register', {
                    title: 'Register Member',
                    currentPage: 'register',
                    user: req.session.user,
                    error: 'Password is required'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert into users table
            await new Promise((resolve, reject) => {
                User.create(cb_number, hashedPassword, role || 'member', (err) => {
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

            console.log('Redirecting to /clerk/members');
            res.redirect('/clerk/members?success=Member registered successfully');

        } catch (error) {
            console.error('Clerk Registration error:', error);
            if (req.file) {
                const filePath = path.join(__dirname, '../public/uploads/profile-pictures', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            res.status(500).render('clerk/register', {
                title: 'Register Member',
                currentPage: 'register',
                user: req.session.user,
                error: `Registration failed: ${error.message}`
            });
        }
    },

    viewMembers: async (req, res) => {
        try {
            console.log('Attempting to fetch members for clerk...');
            
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
            res.render('clerk/members', { 
                members, 
                error: null,
                user: req.session.user,
                title: 'Members List',
                currentPage: 'members'
            });
        } catch (error) {
            console.error('Error rendering members:', error);
            res.status(500).render('clerk/members', {
                members: [],
                error: `Failed to fetch members: ${error.message}`,
                user: req.session.user,
                title: 'Members List',
                currentPage: 'members'
            });
        }
    },

    viewMemberDetails: async (req, res) => {
        try {
            const members = await Member.findByCbNumber(req.params.cbNumber);
            if (!members.length) {
                return res.redirect('/clerk/members?error=Member not found');
            }
            res.render('clerk/member-details', {
                title: 'Member Details',
                currentPage: 'members',
                user: req.session.user,
                member: members[0],
                messages: {
                    success: req.query.success,
                    error: req.query.error
                }
            });
        } catch (err) {
            console.error('Clerk Member details error:', err);
            res.redirect('/clerk/members?error=Failed to load member details');
        }
    },

    updateMember: async (req, res) => {
        try {
            if (!req.session?.user || req.session.user.role !== 'clerk') {
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
    },

    archiveMember: async (req, res) => {
        try {
            if (!req.session?.user || req.session.user.role !== 'clerk') {
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
    },

    restoreMember: async (req, res) => {
        try {
            if (!req.session?.user || req.session.user.role !== 'clerk') {
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
    },

    getArchivedMembers: async (req, res) => {
        try {
            if (!req.session?.user || req.session.user.role !== 'clerk') {
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
    }
};