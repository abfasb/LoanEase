class RiskAssessment {
    // Salary Loan Assessment with refined scoring
    static assessSalaryLoan(loanData) {
        const scoringRules = {
            salaryRatio: [
                { threshold: 0.5, score: 30 },
                { threshold: 0.3, score: 20 },
                { threshold: 0.1, score: 10 }
            ],
            serviceLength: [
                { threshold: 5, score: 20 },
                { threshold: 2, score: 15 },
                { threshold: 0, score: 5 }
            ],
            loanType: {
                'Salary Loan': 15,
                'Renewal': 10,
                'New': 5
            },
            netPay: [
                { threshold: 20000, score: 15 },
                { threshold: 10000, score: 10 },
                { threshold: 0, score: 5 }
            ]
        };

        let score = this._calculateScore(loanData, scoringRules);
        return this._getRiskLevel(score);
    }

    // Agricultural Loan Assessment with refined scoring
    static assessAgriculturalLoan(loanData) {
        const scoringRules = {
            incomeRatio: [
                { threshold: 1, score: 30 },
                { threshold: 0.5, score: 20 },
                { threshold: 0.2, score: 10 }
            ],
            collateral: {
                exists: 20
            },
            borrowerType: {
                'Old': 15,
                'default': 5
            },
            loanStatus: {
                'Current': 15,
                'With O/B Balance': 5,
                'Past Due': -10
            },
            outstandingBalance: [
                { threshold: 0, condition: '==', score: 20 },
                { threshold: 0.5, condition: '<', score: 10 }
            ]
        };

        let score = this._calculateScore(loanData, scoringRules);
        return this._getRiskLevel(score);
    }

    // Generic scoring calculator
    static _calculateScore(data, rules) {
        let score = 0;

        // Salary/Income Ratio
        if (rules.salaryRatio || rules.incomeRatio) {
            const ratioType = rules.salaryRatio ? 'salaryRatio' : 'incomeRatio';
            const ratioValue = rules.salaryRatio 
                ? data.basic_monthly_salary / data.loan_amount 
                : data.annual_income / data.loan_amount;
            
            score += this._evaluateThreshold(ratioValue, rules[ratioType]);
        }

        // Service Length (for salary loans)
        if (rules.serviceLength) {
            score += this._evaluateThreshold(data.length_of_service, rules.serviceLength);
        }

        // Loan Type (for salary loans)
        if (rules.loanType) {
            score += rules.loanType[data.loan_type] || 0;
        }

        // Net Pay (for salary loans)
        if (rules.netPay) {
            score += this._evaluateThreshold(data.net_take_home_pay, rules.netPay);
        }

        // Collateral (for agricultural loans)
        if (rules.collateral && data.collateral) {
            score += rules.collateral.exists;
        }

        // Borrower Type (for agricultural loans)
        if (rules.borrowerType) {
            score += data.borrower_type.includes('Old') 
                ? rules.borrowerType['Old'] 
                : rules.borrowerType.default;
        }

        // Loan Status (for agricultural loans)
        if (rules.loanStatus) {
            score += rules.loanStatus[data.loan_status] || 0;
        }

        // Outstanding Balance (for agricultural loans)
        if (rules.outstandingBalance) {
            const balanceRatio = data.outstanding_balance / data.previous_loan_amount;
            score += this._evaluateConditionalThreshold(
                balanceRatio,
                rules.outstandingBalance
            );
        }

        return score;
    }

    // Helper for threshold-based scoring
    static _evaluateThreshold(value, thresholds) {
        for (const { threshold, score } of thresholds) {
            if (value > threshold) return score;
        }
        return 0;
    }

    // Helper for conditional threshold checks
    static _evaluateConditionalThreshold(value, rules) {
        for (const rule of rules) {
            if (rule.condition === '<' && value < rule.threshold) return rule.score;
            if (rule.condition === '==' && value === rule.threshold) return rule.score;
            if (!rule.condition && value > rule.threshold) return rule.score;
        }
        return 0;
    }

    // Risk level classification
    static _getRiskLevel(score) {
        if (score >= 80) return 'Low';
        if (score >= 50) return 'Moderate';
        return 'High';
    }
}

module.exports = RiskAssessment;