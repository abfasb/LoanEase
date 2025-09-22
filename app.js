const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const paymentRoutes = require('./routes/paymentRoutes');
const { isAdmin, isClerk, isCashier, isMember } = require('./middlewares/authMiddleware');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');
const loanRoutes = require("./routes/loanRoutes");
const riskRoutes = require("./routes/riskRoutes");
const clerkRoutes = require("./routes/clerkRoutes");
const cashierRoutes = require('./routes/cashierRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve Static Files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`📌 ${req.method} request to ${req.url}`);
    next();
});

// Routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/member', memberRoutes);
app.use("/member", loanRoutes);
app.use('/api', loanRoutes);
app.use('/api/risk', riskRoutes);
app.use('/clerk', clerkRoutes);
app.use('/cashier', cashierRoutes);
app.use('/', paymentRoutes);
app.use('/admin/announcements', isAdmin, announcementRoutes);
app.use('/cashier/announcements', isCashier, announcementRoutes);
app.use('/clerk/announcements', isClerk, announcementRoutes);
app.use('/member/announcements', isMember, announcementRoutes);
app.use('/clerk/reports', isClerk, require('./routes/clerkReports'));
app.use('/admin/reports', isAdmin, reportRoutes);

// Default route
app.get('/', (req, res) => res.redirect('/login'));

// 404 Error Handling
app.use((req, res) => {
    console.error(`❌ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).render('404', { url: req.url });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <h1>Something broke!</h1>
        <p>We're working on fixing this. Please try again later.</p>
        <p>Error: ${err.message}</p>
    `);
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));  