import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore.js';
import { MapPin, LogOut, BarChart3, Settings } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glassmorphism border-b">
      <div className="container-max flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600"
            whileHover={{ scale: 1.1 }}
          />
          <span className="font-bold text-lg">SmartCityX</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/report"
              className="btn-primary hidden sm:inline-block"
            >
              Report Issue
            </Link>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <BarChart3 size={20} />
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {menuOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {user.email}
                  </p>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-issues"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    My Issues
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
