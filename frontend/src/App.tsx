import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import ProductForm from './components/ProductForm';
import Dashboard from './components/Dashboard';
import ReportViewer from './components/ReportViewer';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import { authService, User } from './services/apiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Only fetch current user if we don't have one yet
    if (!currentUser) {
      const fetchCurrentUser = async () => {
        try {
          // Get user from service
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Error fetching user:', error instanceof Error ? error.message : 'Failed to fetch user');
          toast.error('Failed to load user data');
        }
      };

      fetchCurrentUser();
    }
  }, [currentUser]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      toast.success('Logged out successfully');
      // Clear auth state
      localStorage.removeItem('authState');
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error instanceof Error ? error.message : 'Failed to logout');
      toast.error('Failed to logout');
    }
  };

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navigation 
          currentUser={currentUser} 
          onLogin={() => setShowAuthModal(true)}
          onLogout={() => {
            setShowAuthModal(false);
            handleLogout();
          }}
        />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/submit" element={<ProductForm currentUser={currentUser} />} />
            <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
            <Route path="/report/:id" element={<ReportViewer />} />
          </Routes>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
            },
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Error in App component:', error instanceof Error ? error.message : 'Unknown error');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Application Error</h1>
          <p className="mt-2 text-gray-600">An unexpected error occurred while rendering the application.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}

export default App;