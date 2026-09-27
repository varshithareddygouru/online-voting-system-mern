import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FiSun, FiMoon, FiLogOut, FiCheckSquare, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, role, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-slate-800 dark:text-white">
        <FiCheckSquare className="text-brand-600 dark:text-brand-400 w-6 h-6" />
        <span>Secure<span className="text-brand-600 dark:text-brand-400">Vote</span></span>
      </Link>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {user ? (
          <div className="flex items-center space-x-3">
            {/* User Details Link */}
            <Link
              to={role === 'admin' || role === 'superadmin' ? '/admin' : '/dashboard'}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <img
                src={user.profileImage ? `http://localhost:5000${user.profileImage}` : 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-brand-200 dark:border-brand-900"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=User';
                }}
              />
              <span className="hidden md:inline text-sm font-semibold text-slate-700 dark:text-slate-300">
                {user.fullName || user.username}
              </span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm shadow-brand-500/10 hover:shadow-brand-500/20"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
