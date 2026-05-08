import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import { asyncHandler } from '../middlewares/error.js';

// Register user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, latitude, longitude } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 'Email already registered', 409);
  }

  // Create new user
  const user = new User({
    name,
    email,
    password,
    location: {
      type: 'Point',
      coordinates: [longitude || 0, latitude || 0],
    },
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id, user.role);

  return successResponse(
    res,
    {
      token,
      user: user.toJSON(),
    },
    'User registered successfully',
    201
  );
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    return errorResponse(res, 'User account is deactivated', 403);
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  return successResponse(
    res,
    {
      token,
      user: user.toJSON(),
    },
    'Login successful'
  );
});

// Get current user profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, user.toJSON(), 'Profile retrieved');
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, latitude, longitude } = req.body;

  const user = await User.findById(req.user.userId);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Update fields
  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  if (latitude && longitude) {
    user.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }

  await user.save();

  return successResponse(res, user.toJSON(), 'Profile updated successfully');
});

// Get user's issues
export const getUserIssues = asyncHandler(async (req, res) => {
  const Issue = (await import('../models/Issue.js')).default;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const issues = await Issue.find({ reporter: req.user.userId })
    .populate('reporter', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Issue.countDocuments({ reporter: req.user.userId });

  return res.status(200).json({
    success: true,
    data: issues,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Logout (client-side primarily)
export const logout = asyncHandler(async (req, res) => {
  return successResponse(res, null, 'Logged out successfully');
});
