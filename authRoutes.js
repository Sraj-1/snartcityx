import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getUserIssues,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validate,
} from '../utils/validation.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, validate, register);
router.post('/login', validateLogin, validate, login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/my-issues', authenticateToken, getUserIssues);

export default router;
