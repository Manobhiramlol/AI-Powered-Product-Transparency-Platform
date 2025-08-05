import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Share2, Award, AlertCircle, CheckCircle, Info, ArrowLeft, Calendar, Building, Package } from 'lucide-react';
import { getProductSubmission, generatePDFReport } from '../services/apiService';
import type { ProductSubmission } from '../services/apiService';
import toast from 'react-hot-toast';

const ReportViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ProductSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    try {
      const data = await getProductSubmission(id!);
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    
    setGeneratingPDF(true);
    try {
      const pdfBlob = await generatePDFReport(id);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report?.productName || 'Product'}_Transparency_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Outstanding Transparency';
    if (score >= 80) return 'Excellent Transparency';
    if (score >= 70) return 'Good Transparency';
    if (score >= 60) return 'Fair Transparency';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h2>
            <p className="text-gray-600 mb-8">The requested transparency report could not be found.</p>
            <Link 
              to="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.productName}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>{report.brand}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>{report.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={generatingPDF}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </>
                  )}
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transparency Score */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Transparency Score</h2>
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="3"
                    strokeDasharray={`${report.transparencyScore}, 100`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={report.transparencyScore >= 80 ? '#10b981' : report.transparencyScore >= 60 ? '#f59e0b' : '#ef4444'} />
                      <stop offset="100%" stopColor={report.transparencyScore >= 80 ? '#059669' : report.transparencyScore >= 60 ? '#d97706' : '#dc2626'} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{report.transparencyScore}</div>
                    <div className="text-sm text-gray-600">/ 100</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getScoreColor(report.transparencyScore)} mb-4`}>
              {getScoreDescription(report.transparencyScore)}
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This score reflects the level of transparency and completeness of information provided about your product.
            </p>
          </div>
        </div>

        {/* Product Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Product Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <p className="text-gray-900">{report.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ingredients</label>
                <p className="text-gray-900">{report.ingredients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Certifications
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Certifications</label>
                <p className="text-gray-900">{report.certifications || 'No certifications listed'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Supply Chain Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Supply Chain & Manufacturing</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Sourcing Information</label>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{report.sourcing}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Manufacturing Process</label>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{report.manufacturing}</p>
            </div>
          </div>
        </div>

        {/* Insights and Recommendations */}
        {report.insights && report.insights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              AI-Generated Insights
            </h3>
            <div className="space-y-4">
              {report.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-800">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Footer */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center text-gray-600">
            <p className="mb-2">This report was generated on {new Date().toLocaleDateString()} by Altibbe's Product Transparency Platform</p>
            <p className="text-sm">For questions about this report, please contact your system administrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;