// controllers/announcementController.js
const Announcement = require('../models/Announcement');

exports.getAnnouncements = (req, res) => {
    const role = req.user && req.user.role ? req.user.role.toLowerCase() : 'member';
    const cb_number = req.user && req.user.cb_number ? req.user.cb_number : 'Guest';
    const user = req.user || { cb_number: 'Guest', role: 'member' }; // Add user
    console.log('User for announcements:', { role, cb_number });
    
    Announcement.getAll((err, announcements) => {
        if (err) {
            console.error('Error fetching announcements:', err);
            return res.status(500).send('Server Error');
        }
        res.render(`${role}/announcements`, { 
            announcements, 
            role, 
            cb_number,
            user // Pass user object
        });
    });
};

exports.createAnnouncement = (req, res) => {
    const { title, content } = req.body;
    const createdBy = req.user && req.user.cb_number ? req.user.cb_number : 'Unknown';
    const role = req.user && req.user.role ? req.user.role.toLowerCase() : 'member';
    console.log('req.user in createAnnouncement:', req.user);
    
    Announcement.create(title, content, createdBy, (err) => {
        if (err) {
            console.error('Error creating announcement:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect(`/${role}/announcements`);
    });
};

module.exports = exports;