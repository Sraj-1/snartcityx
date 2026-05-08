import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { useIssuesStore } from '../store/issuesStore.js';
import { IssueCard } from '../components/Issues/IssueCard.jsx';
import { LoadingSpinner } from '../components/Common/LoadingSpinner.jsx';
import { MapPin, AlertCircle, Filter } from 'lucide-react';

export const HomePage = () => {
  const { user } = useAuthStore();
  const { issues, fetchIssues, loading, filters, setFilters } = useIssuesStore();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
    fetchIssues({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container-max text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">SmartCityX</h1>
          <p className="text-xl mb-8 opacity-90">
            Together, let's make our city better. Report issues, track progress, celebrate improvements.
          </p>
          {user && (
            <motion.button
              onClick={() => navigate('/report')}
              className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Report an Issue
            </motion.button>
          )}
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-max grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl font-bold text-blue-600">{issues.length}</div>
            <p className="text-gray-600 dark:text-gray-400">Issues Reported</p>
          </motion.div>
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl font-bold text-green-600">
              {issues.filter((i) => i.status === 'resolved').length}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Resolved</p>
          </motion.div>
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl font-bold text-yellow-600">
              {issues.filter((i) => i.status === 'in_progress').length}
            </div>
            <p className="text-gray-600 dark:text-gray-400">In Progress</p>
          </motion.div>
        </div>
      </section>

      {/* Issues Section */}
      <section className="container-max py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Recent Issues</h2>
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Filter size={18} />
            Filters
          </motion.button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            className="glassmorphism p-4 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-base"
            >
              <option value="">All Categories</option>
              <option value="pothole">Pothole</option>
              <option value="traffic_light">Traffic Light</option>
              <option value="street_light">Street Light</option>
              <option value="water">Water Leak</option>
              <option value="garbage">Garbage</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-base"
            >
              <option value="">All Status</option>
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <motion.button
              onClick={() => {
                setFilters({ category: '', status: '', page: 1 });
                fetchIssues({ category: '', status: '', page: 1 });
              }}
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
            >
              Reset Filters
            </motion.button>
          </motion.div>
        )}

        {/* Issues Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : issues.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2">No issues found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {user
                ? "Be the first to report an issue in your area"
                : "Login to report issues and help improve the city"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue, index) => (
              <motion.div
                key={issue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <IssueCard
                  issue={issue}
                  onClick={() => navigate(`/issue/${issue._id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
