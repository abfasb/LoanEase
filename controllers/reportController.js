const Report = require('../models/Report');
const { Parser } = require('json2csv');

// Admin reports
exports.getReportsPage = (req, res) => {
  console.log('📌 Handling /admin/reports in reportController');
  res.render('admin/reports', { 
    title: 'Reports',
    user: req.user,
    reports: null,
    reportType: null,
    startDate: null,
    endDate: null,
    error: null
  });
};

exports.generateReports = (req, res) => {
  const { reportType, startDate, endDate } = req.body;
  
  if (!reportType || !startDate || !endDate) {
    return res.render('admin/reports', {
      title: 'Reports',
      user: req.user,
      error: 'Please fill all fields',
      reports: null,
      reportType: null,
      startDate: null,
      endDate: null
    });
  }
  
  if (reportType === 'salary') {
    Report.getSalaryLoanReports(startDate, endDate, (err, reports) => {
      if (err) {
        console.error('Error generating salary reports:', err);
        return res.status(500).render('admin/reports', {
          title: 'Reports',
          user: req.user,
          error: 'Failed to generate reports',
          reports: null,
          reportType: null,
          startDate: null,
          endDate: null
        });
      }
      
      res.render('admin/reports', {
        title: 'Reports',
        user: req.user,
        reports,
        reportType,
        startDate,
        endDate,
        error: null
      });
    });
  } else if (reportType === 'agricultural') {
    Report.getAgriculturalLoanReports(startDate, endDate, (err, reports) => {
      if (err) {
        console.error('Error generating agricultural reports:', err);
        return res.status(500).render('admin/reports', {
          title: 'Reports',
          user: req.user,
          error: 'Failed to generate reports',
          reports: null,
          reportType: null,
          startDate: null,
          endDate: null
        });
      }
      
      res.render('admin/reports', {
        title: 'Reports',
        user: req.user,
        reports,
        reportType,
        startDate,
        endDate,
        error: null
      });
    });
  } else {
    res.render('admin/reports', {
      title: 'Reports',
      user: req.user,
      reports: null,
      reportType: null,
      startDate: null,
      endDate: null,
      error: 'Invalid report type'
    });
  }
};

exports.getLoanSummary = (req, res) => {
  Report.getLoanSummary((err, summary) => {
    if (err) {
      console.error('Error fetching loan summary:', err);
      return res.status(500).render('admin/loan-summary', {
        title: 'Loan Summary',
        user: req.user,
        error: 'Failed to fetch loan summary',
        summary: null
      });
    }
    
    res.render('admin/loan-summary', {
      title: 'Loan Summary',
      user: req.user,
      summary,
      error: null
    });
  });
};

exports.exportReports = (req, res) => {
  const { reportType, startDate, endDate } = req.query;
  
  if (!reportType || !startDate || !endDate) {
    return res.status(400).send('Missing parameters');
  }
  
  if (reportType === 'salary') {
    Report.exportSalaryReports(startDate, endDate, (err, results) => {
      if (err) {
        console.error('Error exporting salary reports:', err);
        return res.status(500).send('Error exporting reports');
      }
      
      try {
        const fields = [
          'cb_number',
          'loan_type',
          'loan_amount',
          'service_fee',
          'processing_fee',
          'total_deductions',
          'take_home_amount',
          'transaction_date'
        ];
        
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(results);
        
        res.header('Content-Type', 'text/csv');
        res.attachment(`salary-reports-${startDate}-to-${endDate}.csv`);
        res.send(csv);
      } catch (error) {
        console.error('Error creating CSV:', error);
        res.status(500).send('Error creating CSV');
      }
    });
  } else if (reportType === 'agricultural') {
    Report.exportAgriculturalReports(startDate, endDate, (err, results) => {
      if (err) {
        console.error('Error exporting agricultural reports:', err);
        return res.status(500).send('Error exporting reports');
      }
      
      try {
        const fields = [
          'cb_number',
          'property_value',
          'loan_amount',
          'service_fee',
          'processing_fee',
          'total_deductions',
          'take_home_amount',
          'transaction_date'
        ];
        
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(results);
        
        res.header('Content-Type', 'text/csv');
        res.attachment(`agricultural-reports-${startDate}-to-${endDate}.csv`);
        res.send(csv);
      } catch (error) {
        console.error('Error creating CSV:', error);
        res.status(500).send('Error creating CSV');
      }
    });
  } else {
    res.status(400).send('Invalid report type');
  }
};

// Clerk reports
exports.getClerkReportsPage = (req, res) => {
  console.log('📌 Handling /clerk/reports in reportController');
  res.render('clerk/reports', { 
    title: 'Member Reports',
    user: req.user,
    reports: null,
    filters: {
      reportType: 'members',
      startDate: null,
      endDate: null,
      gender: 'all',
      agrarian: 'all'
    },
    error: null
  });
};

exports.generateMemberReports = (req, res) => {
  const { reportType, startDate, endDate, gender, agrarian } = req.body;
  
  if (!reportType) {
    return res.render('clerk/reports', {
      title: 'Member Reports',
      user: req.user,
      error: 'Please select a report type',
      reports: null,
      filters: {
        reportType,
        startDate,
        endDate,
        gender,
        agrarian
      }
    });
  }
  
  if (reportType === 'members') {
    const filters = {
      startDate,
      endDate,
      gender,
      agrarian
    };
    
    Report.getMemberReports(filters, (err, reports) => {
      if (err) {
        console.error('Error generating member reports:', err);
        return res.status(500).render('clerk/reports', {
          title: 'Member Reports',
          user: req.user,
          error: 'Failed to generate reports',
          reports: null,
          filters: {
            reportType,
            startDate,
            endDate,
            gender,
            agrarian
          }
        });
      }
      
      res.render('clerk/reports', {
        title: 'Member Reports',
        user: req.user,
        reports,
        filters: {
          reportType,
          startDate,
          endDate,
          gender,
          agrarian
        },
        error: null
      });
    });
  } else {
    res.render('clerk/reports', {
      title: 'Member Reports',
      user: req.user,
      reports: null,
      filters: {
        reportType,
        startDate,
        endDate,
        gender,
        agrarian
      },
      error: 'Invalid report type'
    });
  }
};

exports.exportMemberReports = (req, res) => {
  const { startDate, endDate, gender, agrarian } = req.query;
  
  const filters = {
    startDate,
    endDate,
    gender,
    agrarian
  };
  
  Report.exportMemberReports(filters, (err, results) => {
    if (err) {
      console.error('Error exporting member reports:', err);
      return res.status(500).send('Error exporting reports');
    }
    
    try {
      const fields = Object.keys(results[0] || {});
      const json2csvParser = new Parser({ fields });
      const csv = results.length ? json2csvParser.parse(results) : 'No data found';
      
      res.header('Content-Type', 'text/csv');
      res.attachment(`member-reports-${startDate || 'all'}-to-${endDate || 'all'}.csv`);
      res.send(csv);
    } catch (error) {
      console.error('Error creating CSV:', error);
      res.status(500).send('Error creating CSV');
    }
  });
};

exports.getMemberStatistics = (req, res) => {
  Report.getMemberStatistics((err, statistics) => {
    if (err) {
      console.error('Error fetching member statistics:', err);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
    
    res.json(statistics);
  });
};