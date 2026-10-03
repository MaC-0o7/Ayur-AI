import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, Brain, Network, Lightbulb, Info, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Leaf },
    { name: 'Herb Explorer', href: '/herbs', icon: Brain },
    { name: 'Knowledge Graph', href: '/graph', icon: Network },
    { name: 'AI Insights', href: '/hypotheses', icon: Lightbulb },
    { name: 'About', href: '/about', icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-xl border-b border-ayurvedic-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-ayurvedic-500 via-ayurvedic-600 to-ayurvedic-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-800 font-serif group-hover:text-ayurvedic-600 transition-colors">
                Ayur AI
              </span>
              <span className="text-xs text-ayurvedic-600 font-medium -mt-1">
                Ancient Wisdom • Modern AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2">
            {isAuthenticated && (
              <>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-ayurvedic-600 hover:bg-ayurvedic-50'
                      }`}
                >
                    <Icon className={`w-4 h-4 ${isActive(item.href) ? 'text-white' : 'text-ayurvedic-500 group-hover:text-ayurvedic-600'}`} />
                    <span>{item.name}</span>
                    {isActive(item.href) && <Sparkles className="w-3 h-3 text-gold-300" />}
                  </Link>
                );
              })}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </>
            )}
            
            {!isAuthenticated && (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 text-white shadow-lg"
              >
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 text-white rounded-xl flex items-center justify-center hover:from-ayurvedic-600 hover:to-ayurvedic-700 transition-all duration-200 shadow-lg"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-4 pb-4 space-y-2 bg-gradient-to-br from-ayurvedic-50 to-gold-50 rounded-2xl mt-4 shadow-xl border border-ayurvedic-200">
              {isAuthenticated ? (
                <>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 group ${
                          isActive(item.href)
                            ? 'bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 text-white shadow-lg'
                            : 'text-gray-600 hover:text-ayurvedic-600 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : 'text-ayurvedic-500 group-hover:text-ayurvedic-600'}`} />
                        <span>{item.name}</span>
                        {isActive(item.href) && <Sparkles className="w-4 h-4 text-gold-300" />}
                      </Link>
                    );
                  })}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 text-white shadow-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
