const db = require('../config/db');

const Member = {
    create: (
        cb_number, first_name, middle_name, last_name, profile_picture, address,
        dob, email, gender, contact_number, beneficiaries, emergency_name,
        emergency_relationship, emergency_address, emergency_contact, date_issued,
        nickname, civil_status, age, place_of_birth, nationality, religion,
        spouse_name, spouse_age, spouse_occupation, father_name, mother_name,
        parent_address, number_of_children, children_info, educational_attainment,
        occupation, other_income, annual_income, elementary_school, elementary_address,
        elementary_year_graduated, secondary_school, secondary_address,
        secondary_year_graduated, college_school, college_address, college_year_graduated,
        vocational_school, vocational_address, vocational_year_graduated,
        membership_date, cooperative_position, emergency_contact_name,
        emergency_contact_address, relation, agrarian_beneficiary, farm_area,
        farm_type, is_tenant, recruited_by, signature, signed_date,
        is_archived, archived_at, callback
    ) => {
        const columns = [
            'cb_number', 'first_name', 'middle_name', 'last_name', 'profile_picture', 'address',
            'dob', 'email', 'gender', 'contact_number', 'beneficiaries', 'emergency_name',
            'emergency_relationship', 'emergency_address', 'emergency_contact', 'date_issued',
            'nickname', 'civil_status', 'age', 'place_of_birth', 'nationality', 'religion',
            'spouse_name', 'spouse_age', 'spouse_occupation', 'father_name', 'mother_name',
            'parent_address', 'number_of_children', 'children_info', 'educational_attainment',
            'occupation', 'other_income', 'annual_income', 'elementary_school', 'elementary_address',
            'elementary_year_graduated', 'secondary_school', 'secondary_address',
            'secondary_year_graduated', 'college_school', 'college_address', 'college_year_graduated',
            'vocational_school', 'vocational_address', 'vocational_year_graduated',
            'membership_date', 'cooperative_position', 'emergency_contact_name',
            'emergency_contact_address', 'relation', 'agrarian_beneficiary', 'farm_area',
            'farm_type', 'is_tenant', 'recruited_by', 'signature', 'signed_date',
            'is_archived', 'archived_at'
        ];
        const query = `
            INSERT INTO members (
                ${columns.join(', ')}
            ) VALUES (${columns.map(() => '?').join(', ')})
        `;
        const values = [
            cb_number, first_name, middle_name, last_name, profile_picture, address,
            dob, email, gender, contact_number, beneficiaries, emergency_name,
            emergency_relationship, emergency_address, emergency_contact, date_issued,
            nickname, civil_status, age, place_of_birth, nationality, religion,
            spouse_name, spouse_age, spouse_occupation, father_name, mother_name,
            parent_address, number_of_children, children_info, educational_attainment,
            occupation, other_income, annual_income, elementary_school, elementary_address,
            elementary_year_graduated, secondary_school, secondary_address,
            secondary_year_graduated, college_school, college_address, college_year_graduated,
            vocational_school, vocational_address, vocational_year_graduated,
            membership_date, cooperative_position, emergency_contact_name,
            emergency_contact_address, relation, agrarian_beneficiary, farm_area,
            farm_type, is_tenant, recruited_by, signature, signed_date,
            is_archived, archived_at
        ];

        if (columns.length !== values.length) {
            console.error(`Column count (${columns.length}) does not match value count (${values.length})`);
            return callback(new Error(`Column count (${columns.length}) does not match value count (${values.length})`), null);
        }

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('SQL Error in Member.create:', err);
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    },

    getAllMembers: (callback) => {
        const sql = "SELECT * FROM members WHERE is_archived = FALSE";
        db.query(sql, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    getArchivedMembers: (callback) => {
        const sql = "SELECT * FROM members WHERE is_archived = TRUE";
        db.query(sql, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    findByCbNumber: (cbNumber) => {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM members WHERE cb_number = ?',
                [cbNumber],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });
    },

    updateByCbNumber: (cbNumber, memberData, callback) => {
        const updateFields = [];
        const updateValues = [];

        const allowedFields = [
            'first_name', 'middle_name', 'last_name', 'address', 'dob', 'email',
            'gender', 'contact_number', 'beneficiaries', 'emergency_name', 
            'emergency_relationship', 'emergency_address', 'emergency_contact',
            'date_issued', 'nickname', 'civil_status', 'age', 'place_of_birth',
            'nationality', 'religion', 'spouse_name', 'spouse_age', 'spouse_occupation',
            'father_name', 'mother_name', 'parent_address', 'number_of_children',
            'children_info', 'educational_attainment', 'occupation', 'other_income',
            'annual_income', 'elementary_school', 'elementary_address', 
            'elementary_year_graduated', 'secondary_school', 'secondary_address',
            'secondary_year_graduated', 'college_school', 'college_address',
            'college_year_graduated', 'vocational_school', 'vocational_address',
            'vocational_year_graduated', 'membership_date', 'cooperative_position',
            'emergency_contact_name', 'emergency_contact_address', 'relation',
            'agrarian_beneficiary', 'farm_area', 'farm_type', 'is_tenant',
            'recruited_by', 'signature', 'signed_date', 'profile_picture'
        ];

        for (const field of allowedFields) {
            if (memberData.hasOwnProperty(field)) {
                updateFields.push(`${field} = ?`);
                updateValues.push(memberData[field]);
            }
        }

        if (updateFields.length === 0) {
            return callback(new Error('No valid fields to update'));
        }

        updateValues.push(cbNumber);

        const query = `UPDATE members SET ${updateFields.join(', ')} WHERE cb_number = ?`;

        db.query(query, updateValues, callback);
    },

    archiveByCbNumber: (cbNumber, callback) => {
        const query = 'UPDATE members SET is_archived = TRUE, archived_at = NOW() WHERE cb_number = ?';
        db.query(query, [cbNumber], callback);
    },

    restoreByCbNumber: (cbNumber, callback) => {
        const query = 'UPDATE members SET is_archived = FALSE, archived_at = NULL WHERE cb_number = ?';
        db.query(query, [cbNumber], callback);
    },

    updatePassword: (cbNumber, newPassword) => {
        return new Promise((resolve, reject) => {
            db.query(
                'UPDATE users SET password = ? WHERE cb_number = ?',
                [newPassword, cbNumber],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
    }
};

module.exports = Member;