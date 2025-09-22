const mysql = require('mysql2');

// Setup the MySQL connection
const db = mysql.createConnection({
    host: 'yamabiko.proxy.rlwy.net',
    user: 'root',
    password: 'dlIydvXIAPyIScWoythUitzmBDVXGQJq',
    database: 'railway',
    port: 58939
});

// Test the connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
});

module.exports = db;
