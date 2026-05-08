# SmartCityX Backend Setup Guide

## Prerequisites

- Node.js v16+ (v18+ recommended)
- MongoDB Atlas or local MongoDB
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartcityx
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Database Setup

#### MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for development)
5. Copy connection string
6. Add to `.env` as `MONGODB_URI`

#### Local MongoDB

```bash
# Install MongoDB Community Edition
# macOS:
brew install mongodb-community

# Start MongoDB:
brew services start mongodb-community

# Connection string:
MONGODB_URI=mongodb://localhost:27017/smartcityx
```

### 4. Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Settings > API Keys
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add to `.env`

### 5. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Testing

### Using Postman

1. Import the collection from `postman_collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:5000
   - `token`: JWT token from login response

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Report Issue (requires auth token)
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Pothole on Main Street" \
  -F "description=Large pothole affecting traffic flow" \
  -F "category=pothole" \
  -F "severity=high" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "image=@/path/to/image.jpg"
```

## Project Structure

```
server/
├── src/
│   ├── config/           # DB, JWT, Cloudinary configs
│   ├── controllers/      # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Auth, error handling
│   ├── utils/           # Helpers, validators
│   └── app.js          # Express setup
├── .env                 # Environment variables
├── .env.example         # Template
├── server.js           # Entry point
└── package.json
```

## Key Features Implemented

✅ JWT Authentication
✅ Role-based Access Control (User/Admin)
✅ MongoDB Geospatial Queries
✅ Cloudinary Image Upload
✅ Issue CRUD Operations
✅ Nearby Issue Detection
✅ Heatmap Data Generation
✅ Admin Statistics Dashboard
✅ Comment & Upvote System
✅ Input Validation
✅ Error Handling

## Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running. Check connection string in `.env`

### Cloudinary Upload Fails
```
Error: 401 Unauthorized
```
**Solution:** Verify Cloudinary credentials in `.env`

### JWT Token Invalid
```
Error: Invalid or expired token
```
**Solution:** Token may be expired. Login again to get new token.

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Add frontend URL to `ALLOWED_ORIGINS` in `.env`

## Production Deployment

### Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create smartcityx-api

# Set environment variables
heroku config:set MONGODB_URI=your_production_db_url
heroku config:set JWT_SECRET=your_production_secret
# ... set other variables

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Render or Railway

Connect GitHub repo and configure environment variables in dashboard.

## Performance Tips

1. **Add database indexes** for frequently queried fields
2. **Use Redis** for caching geospatial queries
3. **Implement pagination** for large result sets
4. **Compress images** before uploading to Cloudinary
5. **Monitor MongoDB performance** with Atlas charts

## Security Checklist

- ✅ Use strong JWT_SECRET (min 32 chars)
- ✅ Set `NODE_ENV=production` for deployments
- ✅ Restrict ALLOWED_ORIGINS to your domain
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Validate all user inputs
- ✅ Sanitize database queries
- ✅ Keep dependencies updated

## Database Maintenance

```bash
# Connect to MongoDB Atlas
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/smartcityx"

# Check collections
show collections

# View data
db.issues.find().pretty()

# Create indexes
db.issues.createIndex({ "location.coordinates": "2dsphere" })
db.issues.createIndex({ "status": 1, "category": 1 })

# Backup database
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/smartcityx"

# Restore database
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/smartcityx" dump/
```

## Monitoring & Logging

Consider using:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **DataDog** for performance monitoring
- **Papertrail** for log aggregation

## Support & Resources

- Backend troubleshooting: Check `/server/src` structure
- MongoDB docs: https://docs.mongodb.com
- Express.js: https://expressjs.com
- Cloudinary: https://cloudinary.com/documentation
