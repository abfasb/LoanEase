const bcrypt = require('bcrypt');
const db = require('../config/db');
const nodemailer = require('nodemailer');

// Show Login Page
exports.showLoginPage = (req, res) => {
  res.render('login', { error: null });
};

// Login Function (updated to include clerk and cashier)
exports.login = (req, res) => {
  const { cb_number, password } = req.body; 

  console.log('🟡 Login Attempt:', cb_number);

  if (!cb_number || !password) {
    return res.render('login', { error: 'User ID and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE cb_number = ?';
  db.query(sql, [cb_number], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.render('login', { error: 'An unexpected error occurred' });
    }

    console.log('🔍 SQL Result:', results);
    if (results.length === 0) {
      console.log('❌ User ID not found:', cb_number);
      return res.render('login', { error: 'Invalid User ID or password' });
    }

    const user = results[0];
    console.log('✅ User Found:', user.cb_number, '| Role:', user.role);

    // Compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('❌ Error verifying password:', err);
        return res.render('login', { error: 'Error verifying password' });
      }

      if (!isMatch) {
        console.log('❌ Incorrect password for:', cb_number);
        return res.render('login', { error: 'Invalid User ID or password' });
      }

      // Store session
      req.session.user = { id: user.id, cb_number: user.cb_number, role: user.role };
      console.log('✅ Session Data:', req.session.user);

      // Redirect based on role (updated to include clerk and cashier)
      switch(user.role) {
        case 'admin':
          return res.redirect('/admin/dashboard');
        case 'clerk':
          return res.redirect('/clerk/dashboard');
        case 'cashier':
          return res.redirect('/cashier/dashboard');
        default:
          return res.redirect('/member/dashboard');
      }
    });
  });
};

// Show Registration Page
exports.showRegisterPage = (req, res) => {
  res.render('register', { error: null });
};

// Register New User (updated to include clerk and cashier)
exports.registerUser = (req, res) => {
  const { cb_number, password, role } = req.body; 

  if (!cb_number || !password || !role) {
    return res.render('register', { error: 'All fields are required' });
  }

  // Validate role
  if (!['admin', 'clerk', 'cashier', 'member'].includes(role)) {
    return res.render('register', { error: 'Invalid role specified' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('❌ Error hashing password:', err);
      return res.render('register', { error: 'Error hashing password' });
    }
    
    console.log('🔑 Hashed Password for', cb_number, ':', hash);

    const sql = 'INSERT INTO users (cb_number, password, role) VALUES (?, ?, ?)';
    db.query(sql, [cb_number, hash, role], (err, result) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.render('register', { error: 'Error creating account' });
      }

      console.log('✅ User registered successfully:', cb_number);
      res.redirect('/login'); 
    });
  });
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

// Show Forgot Password Page
exports.showForgotPasswordPage = (req, res) => {
  res.render('forgot-password', { error: null });
};

// Handle Forgot Password
exports.handleForgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.render('forgot-password', { error: 'Email is required' });
  }

  // Check if email exists in the members table
  const sql = 'SELECT cb_number FROM members WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.render('forgot-password', { error: 'An unexpected error occurred' });
    }

    if (results.length === 0) {
      console.log('❌ Email not found:', email);
      return res.render('forgot-password', { error: 'No account found with that email' });
    }

    const member = results[0];

    // Generate a password reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    
    // Store the token in the users table
    db.query('UPDATE users SET reset_token = ? WHERE cb_number = ?', [resetToken, member.cb_number], (err) => {
      if (err) {
        console.error('❌ Error saving reset token:', err);
        return res.render('forgot-password', { error: 'An error occurred while generating the reset token' });
      }

      console.log('✅ Password reset token generated:', resetToken);

      // Send email with the reset link
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'laireenabrigante02@gmail.com',
          pass: 'lfxv cugi ybko cnlb',
        },
      });

      const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: 'laireenabrigante02@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetLink}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('❌ Error sending email:', err);
          return res.render('forgot-password', { error: 'Failed to send reset email' });
        }

        console.log('✅ Password reset email sent:', info.response);
        res.render('forgot-password', { error: 'Password reset instructions sent to your email' });
      });
    });
  });
};

// Show Reset Password Page
exports.showResetPasswordPage = (req, res) => {
  const { token } = req.params;

  // Check if the token is valid in the users table
  const sql = 'SELECT * FROM users WHERE reset_token = ?';
  db.query(sql, [token], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.render('reset-password', { error: 'An unexpected error occurred' });
    }

    if (results.length === 0) {
      console.log('❌ Invalid token:', token);
      return res.render('reset-password', { error: 'Invalid or expired token' });
    }

    res.render('reset-password', { token, error: null });
  });
};

// Handle Reset Password
exports.handleResetPassword = (req, res) => {
  const { token, password } = req.body;

  if (!password) {
    return res.render('reset-password', { token, error: 'Password is required' });
  }

  // Hash the new password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('❌ Error hashing password:', err);
      return res.render('reset-password', { token, error: 'Error resetting password' });
    }

    // Update the user's password
    const sql = 'UPDATE users SET password = ?, reset_token = NULL WHERE reset_token = ?';
    db.query(sql, [hash, token], (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.render('reset-password', { token, error: 'An unexpected error occurred' });
      }

      if (results.affectedRows === 0) {
        return res.render('reset-password', { token, error: 'Invalid or expired token' });
      }

      console.log('✅ Password reset successfully');
      res.render('reset-password', { token, message: 'Your password has been reset successfully.' });
    });
  });
};

// Clerk Dashboard
exports.showClerkDashboard = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'clerk') {
    return res.redirect('/login');
  }
  res.render('clerk/dashboard', { user: req.session.user });
};

// Cashier Dashboard
exports.showCashierDashboard = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'cashier') {
    return res.redirect('/login');
  }
  res.render('cashier/dashboard', { user: req.session.user });
};