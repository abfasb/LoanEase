// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user) {
        console.log('Not authenticated, redirecting to login');
        return res.redirect('/login');
    }
    req.user = req.session.user; // Set req.user
    console.log('req.user set in middleware:', req.user); // Debug log
    return next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.role) {
        return res.status(404).render('404', { message: 'Access denied. Please log in.' });
    }
    req.user = req.session.user; // Set req.user
    if (req.session.user.role === 'admin') {
        return next();
    }
    return res.status(404).render('404', { message: 'Admin access required' });
};

// Check if user is member
const isMember = (req, res, next) => {
    if (!req.session.user || !req.session.user.role) {
        return res.status(404).render('404', { message: 'Access denied. Please log in.' });
    }
    req.user = req.session.user; // Set req.user
    if (req.session.user.role === 'member') {
        return next();
    }
    return res.status(404).render('404', { message: 'Member access required' });
};

// Check if user is clerk
const isClerk = (req, res, next) => {
    if (!req.session.user || !req.session.user.role) {
        return res.status(404).render('404', { message: 'Access denied. Please log in.' });
    }
    req.user = req.session.user; // Set req.user
    if (req.session.user.role === 'clerk') {
        return next();
    }
    return res.status(404).render('404', { message: 'Clerk access required' });
};

// Check if user is cashier
const isCashier = (req, res, next) => {
    if (!req.session.user || !req.session.user.role) {
        return res.status(404).render('404', { message: 'Access denied. Please log in.' });
    }
    req.user = req.session.user; // Set req.user
    if (req.session.user.role === 'cashier') {
        return next();
    }
    return res.status(404).render('404', { message: 'Cashier access required' });
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isMember,
    isClerk,
    isCashier
};