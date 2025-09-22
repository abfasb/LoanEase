// Generate unique reference numbers
exports.generateReferenceNumber = (prefix) => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${timestamp}${random}`;
};

// Calculate payment schedule
exports.calculatePaymentSchedule = (loanAmount, loanType, startDate) => {
    const isRegular = loanType !== 'salary' && loanType !== 'bonuses';
    const loanTermMonths = loanAmount >= 100000 ? 24 : 12;
    const paymentsPerMonth = isRegular ? 1 : 2;
    const totalPayments = loanTermMonths * paymentsPerMonth;
    const principalPerPayment = Math.round(loanAmount / totalPayments);
    const interestRate = isRegular ? 0.03 : 0.01;
    const paymentIntervalDays = isRegular ? 30 : 15;
    
    const schedule = [];
    let remainingBalance = loanAmount;
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < totalPayments; i++) {
        const interest = Math.round(remainingBalance * interestRate);
        const totalPayment = principalPerPayment + interest;
        remainingBalance = Math.max(0, remainingBalance - principalPerPayment);
        
        // Add payment interval to date
        if (i > 0) {
            currentDate.setDate(currentDate.getDate() + paymentIntervalDays);
        }
        
        schedule.push({
            sequence: i + 1,
            dueDate: new Date(currentDate),
            principal: principalPerPayment,
            interest: interest,
            totalPayment: totalPayment,
            remainingBalance: remainingBalance
        });
    }
    
    return schedule;
};

// Format currency
exports.formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

// Format date
exports.formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};