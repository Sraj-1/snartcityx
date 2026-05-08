import express from 'express';
import {
  getDashboardStats,
  getAnalytics,
  getCategoryDistribution,
  getHotspots,
  getUserStats,
  bulkUpdateStatus,
} from '../controllers/adminController.js';
import { authenticateToken, authorizeAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, authorizeAdmin);

// Dashboard stats
router.get('/statistics', getDashboardStats);

// Analytics
router.get('/analytics', getAnalytics);

// Category distribution
router.get('/categories', getCategoryDistribution);

// Geographic hotspots
router.get('/hotspots', getHotspots);

// User statistics
router.get('/users/stats', getUserStats);

// Bulk operations
router.put('/issues/bulk-status', bulkUpdateStatus);

export default router;
