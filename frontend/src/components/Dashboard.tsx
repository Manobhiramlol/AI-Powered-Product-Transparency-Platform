import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Package, Award, Search, Eye, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductSubmissions } from '../services/apiService';
import type { ProductSubmission, User } from '../services/apiService';
import toast from 'react-hot-toast';

interface DashboardProps {
  currentUser: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterAndSortSubmissions();
  }, [submissions, searchTerm, selectedCategory, sortBy]);

  const loadSubmissions = async () => {
    try {
      const data = await getProductSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSubmissions = () => {
    let filtered = submissions.filter(submission => {
      const matchesSearch = submission.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || submission.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.transparencyScore - a.transparencyScore;
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'date':
        default:
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
    });

    setFilteredSubmissions(filtered);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const categories = Array.from(new Set(submissions.map(s => s.category))).filter(Boolean);

  const stats = {
    total: submissions.length,
    averageScore: submissions.length > 0 ? Math.round(submissions.reduce((sum, s) => sum + s.transparencyScore, 0) / submissions.length) : 0,
    completed: submissions.filter(s => s.status === 'completed').length,
    pending: submissions.filter(s => s.status === 'pending').length
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-8">Please sign in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Transparency Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-medium">{currentUser.email}</span> from <span className="font-medium">{currentUser.company}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageScore}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'name')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {submissions.length === 0 
                  ? "You haven't submitted any products yet." 
                  : "Try adjusting your search or filters"
                }
              </p>
              {submissions.length === 0 && (
                <Link 
                  to="/submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Submit Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.productName}</div>
                          <div className="text-sm text-gray-500">{submission.brand}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(submission.transparencyScore)}`}>
                          {submission.transparencyScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(submission.submittedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link 
                            to={`/report/${submission.id}`}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 hover:bg-blue-50 rounded"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button 
                            className="text-green-600 hover:text-green-900 transition-colors p-1 hover:bg-green-50 rounded"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;