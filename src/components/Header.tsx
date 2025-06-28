import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Scale from 'lucide-react/dist/esm/icons/scale';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import User from 'lucide-react/dist/esm/icons/user';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import useAuth from '../contexts/useAuth';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="h-8 w-8" style={{ color: '#B88271' }} />
            <span className="text-2xl font-bold text-black">Vakeel Saab AI</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-[#B88271] transition-colors font-medium">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-[#B88271] transition-colors font-medium">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-[#B88271] transition-colors font-medium">Contact</Link>
            {user && (
              <Link to="/dashboard" className="text-gray-700 hover:text-[#B88271] transition-colors font-medium">Dashboard</Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-[#B88271] transition-colors"
                >
                  <img
                    src={user.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{user.name}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-[#B88271] font-medium hover:text-[#a86f5e] transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#B88271] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <Link to="/" className="block py-2 text-gray-700 hover:text-[#B88271]" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/about" className="block py-2 text-gray-700 hover:text-[#B88271]" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block py-2 text-gray-700 hover:text-[#B88271]" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            {user && (
              <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-[#B88271]" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            )}
            
            <div className="pt-4 border-t space-y-2">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 py-2">
                    <img
                      src={user.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-700">{user.name}</span>
                  </div>
                  <Link to="/profile" className="block py-2 text-gray-700 hover:text-[#B88271]" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  <button onClick={handleLogout} className="block w-full text-left py-2 text-gray-700 hover:text-[#B88271]">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-[#B88271] font-medium" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  <Link to="/signup" className="block w-full bg-[#B88271] text-white py-2 rounded-lg font-medium text-center hover:bg-[#a86f5e]" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;