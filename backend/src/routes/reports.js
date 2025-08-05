const express = require('express');
const { body, validationResult } = require('express-validator');
const { Report, Product, Submission } = require('../models');
const { auth } = require('../middleware/auth');
const pdfService = require('../services/pdfService');

const router = express.Router();

// Get all reports for current user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.userId };
    if (status) whereClause.status = status;

    const reports = await Report.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'brand', 'category']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        reports: reports.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: reports.count,
          pages: Math.ceil(reports.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reports'
    });
  }
});

// Get single report by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: [
        {
          model: Product,
          as: 'product'
        },
        {
          model: Submission,
          as: 'submission'
        }
      ]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get report'
    });
  }
});

// Generate PDF report
router.post('/generate/:submissionId', auth, async (req, res) => {
  try {
    const submission = await Submission.findOne({
      where: {
        id: req.params.submissionId,
        userId: req.user.userId
      },
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Generate report number
    const reportNumber = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create report record
    const report = await Report.create({
      productId: submission.productId,
      submissionId: submission.id,
      userId: req.user.userId,
      reportNumber,
      title: `Transparency Report - ${submission.product.name}`,
      transparencyScore: submission.transparencyScore,
      insights: submission.insights,
      recommendations: submission.recommendations,
      status: 'draft'
    });

    // Generate PDF
    const pdfResult = await pdfService.generateTransparencyReport(
      submission.product,
      submission,
      report
    );

    // Update report with PDF URL
    await report.update({
      pdfUrl: pdfResult.url,
      pdfGeneratedAt: new Date(),
      status: 'generated'
    });

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        report,
        pdfUrl: pdfResult.url,
        downloadUrl: `/api/reports/${report.id}/download`
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

// Download PDF report
router.get('/:id/download', auth, async (req, res) => {
  try {
    const report = await Report.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    if (!report.pdfUrl) {
      return res.status(404).json({
        success: false,
        error: 'PDF not generated yet'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="transparency-report-${report.reportNumber}.pdf"`);

    // Stream the PDF file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../', report.pdfUrl);
    
    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({
        success: false,
        error: 'PDF file not found'
      });
    }
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download report'
    });
  }
});

// Update report status
router.put('/:id/status', auth, [
  body('status').isIn(['draft', 'generated', 'published', 'archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const report = await Report.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    await report.update({ status: req.body.status });

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report status'
    });
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    await report.destroy();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete report'
    });
  }
});

module.exports = router; 