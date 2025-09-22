// models/Announcement.js
const db = require('../config/db');

class Announcement {
    static create(title, content, createdBy, callback) {
        db.query(
            'INSERT INTO announcements (title, content, created_by) VALUES (?, ?, ?)',
            [title, content, createdBy],
            (err, result) => {
                if (err) {
                    console.error('Error creating announcement:', err);
                    return callback(err);
                }
                console.log('Result from db.query:', result);
                callback(null, result.insertId || true);
            }
        );
    }

    static getAll(callback) {
        db.query(
            'SELECT * FROM announcements ORDER BY created_at DESC',
            (err, rows) => {
                if (err) {
                    console.error('Error fetching announcements:', err);
                    return callback(err);
                }
                console.log('Query result:', rows);
                callback(null, rows);
            }
        );
    }
}

module.exports = Announcement;