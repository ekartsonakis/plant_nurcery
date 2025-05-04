import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, LogOut, User, Home, Settings, MenuIcon, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <nav className="bg-green-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-xl ml-2">NurseryMap</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <>
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                  <Home className="inline mr-1" size={18} />
                  Home
                </Link>
                <Link to="/layouts" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                  Layouts
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                    <Settings className="inline mr-1" size={18} />
                    Admin
                  </Link>
                )}
                <div className="ml-4 px-3 py-2 flex items-center">
                  <span className="mr-2">{user.name || user.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-sm font-medium text-white hover:text-gray-200 focus:outline-none"
                  >
                    <LogOut size={18} />
                    <span className="ml-1">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                <User className="inline mr-1" size={18} />
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-800 pb-3 px-4">
          {user ? (
            <>
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="inline mr-1" size={18} />
                Home
              </Link>
              <Link 
                to="/layouts" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Layouts
              </Link>
              {user.isAdmin && (
                <Link 
                  to="/admin" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="inline mr-1" size={18} />
                  Admin
                </Link>
              )}
              <div className="mt-3 pt-3 border-t border-green-700">
                <div className="px-3 py-2 text-base font-medium">{user.name || user.email}</div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-green-700 focus:outline-none"
                >
                  <LogOut size={18} />
                  <span className="ml-1">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="inline mr-1" size={18} />
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;