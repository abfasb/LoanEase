// routes/riskRoutes.js
const express = require('express');
const router = express.Router();
const RiskController = require('../controllers/riskController');

// Assess risk for a specific salary loan
router.get('/salary/:applicationNo', async (req, res) => {
    try {
        const result = await RiskController.assessSalaryLoanRisk(req.params.applicationNo);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assess risk for a specific agricultural loan
router.get('/agricultural/:applicationNo', async (req, res) => {
    try {
        const result = await RiskController.assessAgriculturalLoanRisk(req.params.applicationNo);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all high risk loans
router.get('/high-risk', async (req, res) => {
    try {
        const result = await RiskController.getAllHighRiskLoans();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;