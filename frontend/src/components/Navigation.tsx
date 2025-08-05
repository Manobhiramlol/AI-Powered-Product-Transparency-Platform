import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, User, LogOut } from 'lucide-react';
import type { User as UserType } from '../services/apiService';

interface NavigationProps {
  currentUser: UserType | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/submit', label: 'Submit Product' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Altibbe</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                  <User className="w-4 h-4" />
                  <div className="text-sm">
                    <div className="font-medium">{currentUser.email}</div>
                    <div className="text-xs text-gray-500">{currentUser.company}</div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {currentUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4" />
                      <div className="text-sm">
                        <div className="font-medium">{currentUser.email}</div>
                        <div className="text-xs text-gray-500">{currentUser.company}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onLogin();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;