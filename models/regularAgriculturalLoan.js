const db = require('../config/db');

const RegularAgriculturalLoan = {
    findAllByCbNumber: async (cb_number) => {
        const [rows] = await db.promise().query(
            'SELECT * FROM regular_agricultural_loans WHERE cb_number = ?',
            [cb_number]
        );
        return rows;
    }
};

module.exports = RegularAgriculturalLoan;