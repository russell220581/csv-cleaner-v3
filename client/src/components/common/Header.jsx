import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Upload,
  Home,
  BarChart3,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import '../../styles/components/header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span>📊 CSV Cleaner Pro</span>
        </Link>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Home size={18} />
            Home
          </Link>

          <Link
            to="/pricing"
            className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <CreditCard size={18} />
            Pricing
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Upload size={18} />
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart3 size={18} />
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {isAuthenticated && (
          <div className="user-menu">
            <button
              className="user-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <User size={20} />
              <span>{user?.name}</span>
            </button>

            {isUserMenuOpen && (
              <div className="dropdown-menu">
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <Settings size={16} />
                  Profile
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

export default Header;
