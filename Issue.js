import mongoose from 'mongoose';

const IssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: 10,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: {
        values: ['pothole', 'traffic_light', 'street_light', 'water', 'garbage', 'other'],
        message: 'Please select a valid category',
      },
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['reported', 'in_progress', 'resolved', 'rejected'],
        message: 'Invalid status',
      },
      default: 'reported',
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Please select a valid severity level',
      },
      default: 'medium',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please provide coordinates'],
      },
      address: String,
    },
    image: {
      type: String,
      required: [true, 'Please upload an image'],
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index
IssueSchema.index({ 'location.coordinates': '2dsphere' });

// Index for frequently queried fields
IssueSchema.index({ status: 1, category: 1 });
IssueSchema.index({ reporter: 1 });
IssueSchema.index({ createdAt: -1 });

// Static method to find nearby issues
IssueSchema.statics.findNearby = function (longitude, latitude, maxDistance = 5000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance, // meters
      },
    },
  });
};

// Method to increment upvotes
IssueSchema.methods.addUpvote = function (userId) {
  if (!this.upvoters.includes(userId)) {
    this.upvoters.push(userId);
    this.upvotes += 1;
  }
  return this.save();
};

// Method to remove upvote
IssueSchema.methods.removeUpvote = function (userId) {
  const index = this.upvoters.indexOf(userId);
  if (index > -1) {
    this.upvoters.splice(index, 1);
    this.upvotes -= 1;
  }
  return this.save();
};

const Issue = mongoose.model('Issue', IssueSchema);
export default Issue;
