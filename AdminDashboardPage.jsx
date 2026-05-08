import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { adminAPI } from '../api/client.js';
import { LoadingSpinner } from '../components/Common/LoadingSpinner.jsx';
import { BarChart3, AlertCircle, CheckCircle, Users } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        setStats(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: AlertCircle, label: 'Total Issues', value: stats?.totalIssues, color: 'blue' },
    { icon: CheckCircle, label: 'Resolved', value: stats?.issuesByStatus?.find(s => s._id === 'resolved')?.count || 0, color: 'green' },
    { icon: Users, label: 'Active Users', value: stats?.totalUsers, color: 'purple' },
    { icon: BarChart3, label: 'Recent Issues', value: stats?.recentIssues, color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor city issues and system performance</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {card.label}
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${card.color === 'blue' ? 'text-blue-600' : card.color === 'green' ? 'text-green-600' : card.color === 'purple' ? 'text-purple-600' : 'text-amber-600'}`}>
                    {card.value}
                  </p>
                </div>
                <card.icon className="text-gray-300 dark:text-gray-600" size={32} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Issues by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-bold mb-6">Issues by Status</h2>
            <div className="space-y-4">
              {stats?.issuesByStatus?.map((status) => {
                const statusLabels = { reported: 'Reported', in_progress: 'In Progress', resolved: 'Resolved', rejected: 'Rejected' };
                const statusColors = { reported: 'yellow', in_progress: 'blue', resolved: 'green', rejected: 'red' };
                const color = statusColors[status._id];
                return (
                  <div key={status._id}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{statusLabels[status._id]}</span>
                      <span className="font-bold">{status.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-full rounded-full ${color === 'yellow' ? 'bg-yellow-500' : color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(status.count / stats.totalIssues) * 100}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Issues by Category */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-bold mb-6">Issues by Category</h2>
            <div className="space-y-4">
              {stats?.issuesByCategory?.map((category) => {
                const categoryEmoji = {
                  pothole: '🚗',
                  traffic_light: '🚦',
                  street_light: '💡',
                  water: '💧',
                  garbage: '🗑️',
                  other: '❓',
                };
                return (
                  <div key={category._id} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>{categoryEmoji[category._id] || '❓'}</span>
                      <span className="capitalize">{category._id.replace('_', ' ')}</span>
                    </span>
                    <span className="font-bold text-blue-600">{category.count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Top Reporters */}
        {stats?.topReporters && stats.topReporters.length > 0 && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold mb-6">Top Reporters</h2>
            <div className="space-y-3">
              {stats.topReporters.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold">
                      {item.user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{item.user?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.user?.email}</p>
                    </div>
                  </div>
                  <span className="font-bold text-blue-600">{item.issueCount} reports</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
