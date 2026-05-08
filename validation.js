import { body, validationResult, query } from 'express-validator';

// Validation middleware to check for errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      if (!formattedErrors[error.param]) {
        formattedErrors[error.param] = error.msg;
      }
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  next();
};

// Auth validation
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Issue validation
export const validateIssue = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['pothole', 'traffic_light', 'street_light', 'water', 'garbage', 'other'])
    .withMessage('Invalid category'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid severity level'),
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address is too long'),
];

// Query validation for nearby issues
export const validateNearbyQuery = [
  query('maxDistance')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Max distance must be between 100 and 50000 meters'),
];

// Status update validation
export const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['reported', 'in_progress', 'resolved', 'rejected'])
    .withMessage('Invalid status'),
  body('resolutionNote')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Resolution note must be between 5 and 500 characters'),
];
