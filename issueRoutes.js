import express from 'express';
import {
  createIssue,
  getAllIssues,
  getIssue,
  getNearbyIssues,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
  addComment,
  upvoteIssue,
  getHeatmapData,
} from '../controllers/issueController.js';
import { authenticateToken, authorizeAdmin } from '../middlewares/auth.js';
import { uploadMiddleware } from '../config/cloudinary.js';
import {
  validateIssue,
  validateStatusUpdate,
  validate,
} from '../utils/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllIssues);
router.get('/nearby/:lat/:lng', getNearbyIssues);
router.get('/heatmap-data', getHeatmapData);
router.get('/:id', getIssue);

// Protected routes
router.post(
  '/',
  authenticateToken,
  uploadMiddleware.single('image'),
  validateIssue,
  validate,
  createIssue
);

router.put('/:id', authenticateToken, updateIssue);
router.delete('/:id', authenticateToken, deleteIssue);

// Comments and votes
router.post('/:id/comments', authenticateToken, addComment);
router.post('/:id/upvote', authenticateToken, upvoteIssue);

// Admin routes
router.put(
  '/:id/status',
  authenticateToken,
  authorizeAdmin,
  validateStatusUpdate,
  validate,
  updateIssueStatus
);

export default router;
