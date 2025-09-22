const db = require('../config/db');

const SalaryBonusLoan = {
    findOneByCbNumber: async (cb_number) => {
        const [rows] = await db.promise().query(
            'SELECT * FROM salary_bonuses_loans WHERE cb_number = ? ORDER BY application_date DESC LIMIT 1',
            [cb_number]
        );
        return rows[0] || null;
    },
    
    findAllByCbNumber: async (cb_number) => {
        const [rows] = await db.promise().query(
            'SELECT * FROM salary_bonuses_loans WHERE cb_number = ?',
            [cb_number]
        );
        return rows;
    }
};

module.exports = SalaryBonusLoan;