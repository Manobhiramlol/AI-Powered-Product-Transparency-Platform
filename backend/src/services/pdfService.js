const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  constructor() {
    this.outputDir = path.join(__dirname, '../../uploads/reports');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  generateTransparencyReport(product, submission, report) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const filename = `transparency-report-${report.reportNumber}-${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, product, report);

        // Product Information
        this.addProductInfo(doc, product);

        // Transparency Score
        this.addTransparencyScore(doc, submission);

        // Insights and Recommendations
        this.addInsights(doc, submission);

        // Detailed Responses
        this.addDetailedResponses(doc, submission);

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          resolve({
            filename,
            filepath,
            url: `/uploads/reports/${filename}`
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  addHeader(doc, product, report) {
    // Logo/Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('Product Transparency Report', { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Report #: ${report.reportNumber}`, { align: 'center' })
       .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })
       .moveDown(1);

    // Product title
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text(product.name, { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(14)
       .font('Helvetica')
       .text(`Brand: ${product.brand}`, { align: 'center' })
       .text(`Category: ${product.category}`, { align: 'center' })
       .moveDown(1);
  }

  addProductInfo(doc, product) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Product Information')
       .moveDown(0.5);

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Description: ${product.description}`)
       .moveDown(0.5);

    if (product.ingredients) {
      doc.text(`Ingredients: ${product.ingredients}`)
         .moveDown(0.5);
    }

    if (product.sourcing) {
      doc.text(`Sourcing: ${product.sourcing}`)
         .moveDown(0.5);
    }

    if (product.manufacturing) {
      doc.text(`Manufacturing: ${product.manufacturing}`)
         .moveDown(0.5);
    }

    if (product.certifications) {
      doc.text(`Certifications: ${product.certifications}`)
         .moveDown(0.5);
    }

    doc.moveDown(1);
  }

  addTransparencyScore(doc, submission) {
    const score = submission.transparencyScore || 0;
    const scoreColor = this.getScoreColor(score);

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Transparency Assessment')
       .moveDown(0.5);

    // Score circle
    const centerX = 300;
    const centerY = doc.y + 30;
    const radius = 40;

    doc.circle(centerX, centerY, radius)
       .strokeColor(scoreColor)
       .lineWidth(3)
       .stroke();

    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor(scoreColor)
       .text(`${score}`, centerX - 15, centerY - 10)
       .moveDown(2);

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('black')
       .text(`Score: ${score}/100`, { align: 'center' })
       .text(this.getScoreDescription(score), { align: 'center' })
       .moveDown(1);
  }

  addInsights(doc, submission) {
    const insights = submission.insights || [];
    const recommendations = submission.recommendations || [];

    if (insights.length > 0) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Key Insights')
         .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica');

      insights.forEach((insight, index) => {
        doc.text(`• ${insight}`)
           .moveDown(0.3);
      });

      doc.moveDown(1);
    }

    if (recommendations.length > 0) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Recommendations')
         .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica');

      recommendations.forEach((recommendation, index) => {
        doc.text(`• ${recommendation}`)
           .moveDown(0.3);
      });

      doc.moveDown(1);
    }
  }

  addDetailedResponses(doc, submission) {
    const responses = submission.dynamicResponses || {};

    if (Object.keys(responses).length > 0) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Detailed Responses')
         .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica');

      Object.entries(responses).forEach(([question, response]) => {
        doc.font('Helvetica-Bold')
           .text(question)
           .moveDown(0.2);

        doc.font('Helvetica')
           .text(response)
           .moveDown(0.5);
      });
    }
  }

  addFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(
           'Generated by Product Transparency Platform',
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
    }
  }

  getScoreColor(score) {
    if (score >= 80) return '#28a745'; // Green
    if (score >= 60) return '#ffc107'; // Yellow
    if (score >= 40) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  }

  getScoreDescription(score) {
    if (score >= 80) return 'Excellent Transparency';
    if (score >= 60) return 'Good Transparency';
    if (score >= 40) return 'Fair Transparency';
    return 'Needs Improvement';
  }
}

module.exports = new PDFService(); 