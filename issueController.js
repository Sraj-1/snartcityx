import Issue from '../models/Issue.js';
import User from '../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responses.js';
import { asyncHandler } from '../middlewares/error.js';

// Create new issue
export const createIssue = asyncHandler(async (req, res) => {
  const { title, description, category, severity, latitude, longitude, address } = req.body;
  const imageUrl = req.file?.path || null;

  if (!imageUrl) {
    return errorResponse(res, 'Image upload is required', 400);
  }

  const issue = new Issue({
    title,
    description,
    category,
    severity: severity || 'medium',
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
      address,
    },
    image: imageUrl,
    reporter: req.user.userId,
  });

  await issue.save();
  await issue.populate('reporter', 'name avatar');

  // Update user's issue count
  await User.findByIdAndUpdate(req.user.userId, { $inc: { issueCount: 1 } });

  return successResponse(res, issue, 'Issue reported successfully', 201);
});

// Get all issues with filters
export const getAllIssues = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status, sortBy = '-createdAt' } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const issues = await Issue.find(filter)
    .populate('reporter', 'name avatar email')
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Issue.countDocuments(filter);

  return paginatedResponse(res, issues, page, limit, total, 'Issues retrieved');
});

// Get single issue
export const getIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
    .populate('reporter', 'name avatar email')
    .populate('resolvedBy', 'name avatar')
    .populate('comments.user', 'name avatar');

  if (!issue) {
    return errorResponse(res, 'Issue not found', 404);
  }

  // Increment view count
  issue.views += 1;
  await issue.save();

  return successResponse(res, issue, 'Issue retrieved');
});

// Get nearby issues (geospatial query)
export const getNearbyIssues = asyncHandler(async (req, res) => {
  const { lat, lng } = req.params;
  const { maxDistance = 5000, category, status } = req.query;

  const filter = {
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(maxDistance),
      },
    },
  };

  if (category) filter.category = category;
  if (status) filter.status = status;

  const issues = await Issue.find(filter)
    .populate('reporter', 'name avatar')
    .limit(50);

  return successResponse(res, issues, 'Nearby issues retrieved');
});

// Update issue
export const updateIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, severity } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) {
    return errorResponse(res, 'Issue not found', 404);
  }

  // Check authorization
  if (
    issue.reporter.toString() !== req.user.userId &&
    req.user.role !== 'admin'
  ) {
    return errorResponse(res, 'Unauthorized to update this issue', 403);
  }

  // Update fields
  if (title) issue.title = title;
  if (description) issue.description = description;
  if (category) issue.category = category;
  if (severity) issue.severity = severity;

  await issue.save();
  await issue.populate('reporter', 'name avatar');

  return successResponse(res, issue, 'Issue updated successfully');
});

// Update issue status (admin only)
export const updateIssueStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, resolutionNote } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) {
    return errorResponse(res, 'Issue not found', 404);
  }

  issue.status = status;
  if (resolutionNote) issue.resolutionNote = resolutionNote;
  if (status === 'resolved') {
    issue.resolvedBy = req.user.userId;
  }

  await issue.save();
  await issue.populate('resolvedBy', 'name avatar');

  return successResponse(res, issue, 'Issue status updated');
});

// Delete issue (admin or owner)
export const deleteIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) {
    return errorResponse(res, 'Issue not found', 404);
  }

  if (issue.reporter.toString() !== req.user.userId && req.user.role !== 'admin') {
    return errorResponse(res, 'Unauthorized to delete this issue', 403);
  }

  await Issue.findByIdAndDelete(id);

  // Decrement user's issue count
  await User.findByIdAndUpdate(issue.reporter, { $inc: { issueCount: -1 } });

  return successResponse(res, null, 'Issue deleted successfully');
});

// Add comment to issue
export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) {
    return errorResponse(res, 'Issue not found', 404);
  }

  issue.comments.push({
    user: req.user.userId,
    text,
  });

  await issue.save();
  await issue.populate('comments.user', 'name avatar');

  return successResponse(res, issue.comments, 'Comment added');
});

// Upvote issue
export const upvoteIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) {
    return errorResponse(res, 'Issue not found', 404);
  }

  const hasUpvoted = issue.upvoters.includes(req.user.userId);

  if (hasUpvoted) {
    await issue.removeUpvote(req.user.userId);
  } else {
    await issue.addUpvote(req.user.userId);
  }

  await issue.populate('reporter', 'name avatar');

  return successResponse(res, issue, hasUpvoted ? 'Upvote removed' : 'Issue upvoted');
});

// Get heatmap data (admin)
export const getHeatmapData = asyncHandler(async (req, res) => {
  const issues = await Issue.find({}, 'location title category status');

  const heatmapData = issues.map((issue) => ({
    lat: issue.location.coordinates[1],
    lng: issue.location.coordinates[0],
    title: issue.title,
    category: issue.category,
    status: issue.status,
    weight: issue.status === 'resolved' ? 0.5 : 1,
  }));

  return successResponse(res, heatmapData, 'Heatmap data retrieved');
});
