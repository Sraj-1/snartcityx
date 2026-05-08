import Issue from '../models/Issue.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import { asyncHandler } from '../middlewares/error.js';

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalIssues = await Issue.countDocuments();
  const issuesByStatus = await Issue.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const issuesByCategory = await Issue.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]);

  const issuesBySeverity = await Issue.aggregate([
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalUsers = await User.countDocuments();
  const totalUpvotes = await Issue.aggregate([
    {
      $group: {
        _id: null,
        totalUpvotes: { $sum: '$upvotes' },
      },
    },
  ]);

  // Issues in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentIssues = await Issue.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  // Top reporters
  const topReporters = await Issue.aggregate([
    {
      $group: {
        _id: '$reporter',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
  ]);

  return successResponse(
    res,
    {
      totalIssues,
      totalUsers,
      recentIssues,
      totalUpvotes: totalUpvotes[0]?.totalUpvotes || 0,
      issuesByStatus,
      issuesByCategory,
      issuesBySeverity,
      topReporters: topReporters.map((item) => ({
        user: item.user[0],
        issueCount: item.count,
      })),
    },
    'Dashboard statistics retrieved'
  );
});

// Get analytics data for charts
export const getAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Issues per day
  const issuesPerDay = await Issue.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Resolution rate
  const totalInPeriod = await Issue.countDocuments({
    createdAt: { $gte: startDate },
  });
  const resolvedInPeriod = await Issue.countDocuments({
    status: 'resolved',
    createdAt: { $gte: startDate },
  });

  const resolutionRate =
    totalInPeriod > 0 ? ((resolvedInPeriod / totalInPeriod) * 100).toFixed(2) : 0;

  // Average time to resolve
  const resolutionTimes = await Issue.aggregate([
    {
      $match: {
        status: 'resolved',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        avgTime: {
          $avg: {
            $subtract: ['$updatedAt', '$createdAt'],
          },
        },
      },
    },
  ]);

  const avgResolutionTime = resolutionTimes[0]?.avgTime
    ? Math.floor(resolutionTimes[0].avgTime / (1000 * 60 * 60 * 24)) // Convert to days
    : 0;

  return successResponse(
    res,
    {
      issuesPerDay,
      resolutionRate,
      totalInPeriod,
      resolvedInPeriod,
      avgResolutionTime,
    },
    'Analytics data retrieved'
  );
});

// Get category distribution
export const getCategoryDistribution = asyncHandler(async (req, res) => {
  const distribution = await Issue.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        severity: {
          $push: '$severity',
        },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return successResponse(res, distribution, 'Category distribution retrieved');
});

// Get geographic hotspots
export const getHotspots = asyncHandler(async (req, res) => {
  const hotspots = await Issue.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [77.2, 28.6], // Delhi center
        },
        distanceField: 'distance',
        spherical: true,
        limit: 100,
      },
    },
    {
      $group: {
        _id: {
          lat: {
            $round: [
              {
                $arrayElemAt: ['$location.coordinates', 1],
              },
              3,
            ],
          },
          lng: {
            $round: [
              {
                $arrayElemAt: ['$location.coordinates', 0],
              },
              3,
            ],
          },
        },
        count: { $sum: 1 },
        issues: { $push: '$$ROOT' },
      },
    },
    {
      $match: {
        count: { $gte: 3 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 20,
    },
  ]);

  return successResponse(res, hotspots, 'Geographic hotspots retrieved');
});

// Get user statistics
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  const activeUsers = await User.countDocuments({ isActive: true });
  const inactiveUsers = await User.countDocuments({ isActive: false });

  return successResponse(
    res,
    {
      byRole: stats,
      active: activeUsers,
      inactive: inactiveUsers,
    },
    'User statistics retrieved'
  );
});

// Bulk update issue status
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { issueIds, status, resolutionNote } = req.body;

  if (!Array.isArray(issueIds) || issueIds.length === 0) {
    return errorResponse(res, 'Invalid issue IDs', 400);
  }

  const result = await Issue.updateMany(
    { _id: { $in: issueIds } },
    {
      status,
      resolutionNote: resolutionNote || undefined,
      resolvedBy: req.user.userId,
    }
  );

  return successResponse(
    res,
    {
      modifiedCount: result.modifiedCount,
    },
    'Issues updated successfully'
  );
});
