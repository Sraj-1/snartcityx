import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ThumbsUp, MessageCircle } from 'lucide-react';

const categoryEmoji = {
  pothole: '🚗',
  traffic_light: '🚦',
  street_light: '💡',
  water: '💧',
  garbage: '🗑️',
  other: '❓',
};

const statusColor = {
  reported: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const severityColor = {
  low: 'text-blue-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
};

export const IssueCard = ({ issue, onClick }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg overflow-hidden cursor-pointer"
      whileHover={{ y: -4 }}
      onClick={onClick}
    >
      {issue.image && (
        <div className="h-40 overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={issue.image}
            alt={issue.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2 flex-1">
            <span className="text-2xl">{categoryEmoji[issue.category]}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate-text">{issue.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={12} className="inline mr-1" />
                {issue.location?.address || 'No address'}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColor[issue.status]}`}>
            {issue.status.replace('_', ' ')}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate-lines-2 mb-3">
          {issue.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span className={`font-medium ${severityColor[issue.severity]}`}>
              {issue.severity}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp size={14} />
              {issue.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {issue.comments?.length || 0}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(issue.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default IssueCard;
