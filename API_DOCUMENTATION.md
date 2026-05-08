# SmartCityX API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.smartcityx.com/api`

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "confirmPassword": "securepass123"
}
```

Response (201):
```json
{
  "success": true,
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Login User
**POST** `/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

Response (200):
```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "issueCount": 5
    }
  }
}
```

### Get User Profile
**GET** `/auth/profile`

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://res.cloudinary.com/...",
    "issueCount": 5,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Update User Profile
**PUT** `/auth/profile`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "name": "John Updated",
  "avatar": "https://res.cloudinary.com/...",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

Response (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

### Get User's Issues
**GET** `/auth/my-issues?page=1&limit=10`

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Logout
**POST** `/auth/logout`

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

## 🐛 Issues Endpoints

### Get All Issues
**GET** `/issues?page=1&limit=10&category=pothole&status=reported&sortBy=-createdAt`

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category (optional)
- `status` - Filter by status (optional)
- `sortBy` - Sort field with direction (default: -createdAt)

Response (200):
```json
{
  "success": true,
  "message": "Issues retrieved",
  "data": [
    {
      "_id": "507f191e810c19729de860ea",
      "title": "Large pothole on Main St",
      "description": "Dangerous pothole affecting traffic flow",
      "category": "pothole",
      "status": "reported",
      "severity": "high",
      "image": "https://res.cloudinary.com/...",
      "location": {
        "type": "Point",
        "coordinates": [77.2090, 28.6139],
        "address": "123 Main St, Delhi"
      },
      "reporter": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "avatar": "..."
      },
      "upvotes": 15,
      "comments": 3,
      "views": 42,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 127,
    "totalPages": 13,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Single Issue
**GET** `/issues/:id`

Response (200):
```json
{
  "success": true,
  "message": "Issue retrieved",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "title": "Large pothole on Main St",
    "description": "...",
    "comments": [
      {
        "_id": "507f191e810c19729de860eb",
        "user": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Jane Smith",
          "avatar": "..."
        },
        "text": "This is a serious issue!",
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ],
    "upvoters": ["507f1f77bcf86cd799439011"],
    "resolvedBy": null,
    "resolutionNote": null,
    "views": 43
  }
}
```

### Create Issue
**POST** `/issues`

Headers: 
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form Data:
```
title: "Pothole on Main Street"
description: "Large pothole affecting traffic flow"
category: "pothole"
severity: "high"
latitude: "28.6139"
longitude: "77.2090"
address: "123 Main St, Delhi"
image: <file>
```

Response (201):
```json
{
  "success": true,
  "status": 201,
  "message": "Issue reported successfully",
  "data": { ... }
}
```

### Update Issue
**PUT** `/issues/:id`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "street_light",
  "severity": "medium"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": { ... }
}
```

Note: Only issue reporter or admin can update.

### Delete Issue
**DELETE** `/issues/:id`

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "message": "Issue deleted successfully",
  "data": null
}
```

### Get Nearby Issues
**GET** `/issues/nearby/:lat/:lng?maxDistance=5000&category=pothole&status=reported`

Parameters:
- `lat` - Latitude (path)
- `lng` - Longitude (path)
- `maxDistance` - Search radius in meters (default: 5000)
- `category` - Filter by category (optional)
- `status` - Filter by status (optional)

Response (200):
```json
{
  "success": true,
  "message": "Nearby issues retrieved",
  "data": [
    {
      "_id": "507f191e810c19729de860ea",
      "title": "Nearby pothole",
      "location": {
        "coordinates": [77.2100, 28.6150]
      },
      ...
    }
  ]
}
```

### Add Comment to Issue
**POST** `/issues/:id/comments`

Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "text": "This issue affects my daily commute"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Comment added",
  "data": [
    {
      "_id": "507f191e810c19729de860eb",
      "user": { ... },
      "text": "This issue affects my daily commute",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

### Upvote Issue
**POST** `/issues/:id/upvote`

Headers: `Authorization: Bearer <token>`

Response (200):
```json
{
  "success": true,
  "message": "Issue upvoted",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "upvotes": 16,
    "upvoters": ["507f1f77bcf86cd799439011", ...]
  }
}
```

Note: Toggle - calls it again to remove upvote.

### Get Heatmap Data
**GET** `/issues/heatmap-data`

Response (200):
```json
{
  "success": true,
  "message": "Heatmap data retrieved",
  "data": [
    {
      "lat": 28.6139,
      "lng": 77.2090,
      "title": "Pothole",
      "category": "pothole",
      "status": "reported",
      "weight": 1
    }
  ]
}
```

---

## 👮 Admin Endpoints

All require: `Authorization: Bearer <admin_token>`

### Get Dashboard Statistics
**GET** `/admin/statistics`

Response (200):
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved",
  "data": {
    "totalIssues": 127,
    "totalUsers": 45,
    "recentIssues": 8,
    "totalUpvotes": 423,
    "issuesByStatus": [
      { "_id": "reported", "count": 42 },
      { "_id": "in_progress", "count": 32 },
      { "_id": "resolved", "count": 50 },
      { "_id": "rejected", "count": 3 }
    ],
    "issuesByCategory": [
      { "_id": "pothole", "count": 45 },
      { "_id": "traffic_light", "count": 28 },
      { "_id": "street_light", "count": 35 },
      { "_id": "water", "count": 12 },
      { "_id": "garbage", "count": 7 }
    ],
    "issuesBySeverity": [
      { "_id": "low", "count": 30 },
      { "_id": "medium", "count": 60 },
      { "_id": "high", "count": 37 }
    ],
    "topReporters": [
      {
        "user": { "_id": "...", "name": "John Doe", "email": "..." },
        "issueCount": 12
      }
    ]
  }
}
```

### Get Analytics Data
**GET** `/admin/analytics?days=30`

Query Parameters:
- `days` - Number of days (default: 30)

Response (200):
```json
{
  "success": true,
  "message": "Analytics data retrieved",
  "data": {
    "issuesPerDay": [
      { "_id": "2024-01-15", "count": 3 },
      { "_id": "2024-01-16", "count": 5 }
    ],
    "resolutionRate": "39.37",
    "totalInPeriod": 127,
    "resolvedInPeriod": 50,
    "avgResolutionTime": 7
  }
}
```

### Get Category Distribution
**GET** `/admin/categories`

Response (200):
```json
{
  "success": true,
  "message": "Category distribution retrieved",
  "data": [
    {
      "_id": "pothole",
      "count": 45,
      "severity": ["high", "high", "medium", "low", ...]
    }
  ]
}
```

### Get Geographic Hotspots
**GET** `/admin/hotspots`

Response (200):
```json
{
  "success": true,
  "message": "Geographic hotspots retrieved",
  "data": [
    {
      "_id": {
        "lat": 28.613,
        "lng": 77.209
      },
      "count": 8,
      "issues": [...]
    }
  ]
}
```

### Get User Statistics
**GET** `/admin/users/stats`

Response (200):
```json
{
  "success": true,
  "message": "User statistics retrieved",
  "data": {
    "byRole": [
      { "_id": "user", "count": 42 },
      { "_id": "admin", "count": 3 }
    ],
    "active": 40,
    "inactive": 5
  }
}
```

### Update Issue Status
**PUT** `/issues/:id/status`

Request:
```json
{
  "status": "resolved",
  "resolutionNote": "Pothole has been repaired. Road surface replaced."
}
```

Response (200):
```json
{
  "success": true,
  "message": "Issue status updated",
  "data": { ... }
}
```

### Bulk Update Issue Status
**PUT** `/admin/issues/bulk-status`

Request:
```json
{
  "issueIds": ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
  "status": "in_progress",
  "resolutionNote": "Repairs scheduled"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Issues updated successfully",
  "data": {
    "modifiedCount": 2
  }
}
```

### Health Check
**GET** `/health`

Response (200):
```json
{
  "success": true,
  "message": "SmartCityX API is running",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "status": 400,
  "message": "Validation error",
  "errors": {
    "email": "Please provide a valid email",
    "password": "Password must be at least 6 characters"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "status": 401,
  "message": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "status": 403,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "status": 404,
  "message": "Issue not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "status": 409,
  "message": "email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "status": 500,
  "message": "Internal Server Error"
}
```

---

## 📝 Validation Rules

### User Registration
- Name: 2-50 characters
- Email: Valid email format
- Password: Minimum 6 characters
- Confirm Password: Must match password

### Issue Creation
- Title: 5-100 characters
- Description: 10-1000 characters
- Category: Must be valid enum value
- Severity: low/medium/high
- Latitude: -90 to 90
- Longitude: -180 to 180
- Image: Required, max 5MB, JPEG/PNG/WebP only
- Address: Optional, max 200 characters

### Issue Update
- Title, Description, Category, Severity (all optional)
- If provided, must match validation rules above

---

## 🔄 Status Flow

```
Issue Lifecycle:
reported → in_progress → resolved
       ↘               ↗
           rejected
```

Valid status transitions:
- reported → in_progress
- reported → resolved
- reported → rejected
- in_progress → resolved
- in_progress → rejected
- Any → Any (for admin correction)

---

## 📦 Pagination

All list endpoints support pagination:

```
GET /issues?page=2&limit=20
```

Response includes:
```json
{
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 127,
    "totalPages": 7,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## 🔑 Category Enum

- `pothole` - Road defects
- `traffic_light` - Traffic signal issues
- `street_light` - Street lighting issues
- `water` - Water supply/leak issues
- `garbage` - Sanitation issues
- `other` - Other issues

---

## ⚠️ Severity Levels

- `low` - Minor issues, no immediate danger
- `medium` - Moderate issues, affecting usability
- `high` - Critical issues, public safety risk

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login & Store Token
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.data.token')

echo $TOKEN
```

### Create Issue
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Pothole" \
  -F "description=This is a test issue" \
  -F "category=pothole" \
  -F "severity=medium" \
  -F "latitude=28.6139" \
  -F "longitude=77.2090" \
  -F "address=Test Street" \
  -F "image=@/path/to/image.jpg"
```

### Get Issues
```bash
curl http://localhost:5000/api/issues
```

### Get Nearby Issues
```bash
curl "http://localhost:5000/api/issues/nearby/28.6139/77.2090?maxDistance=5000"
```

---

## 📚 Rate Limiting

Currently no rate limiting. For production, implement:
- 100 requests/hour for anonymous
- 1000 requests/hour for authenticated users
- 5000 requests/hour for admins

---

## 🔒 CORS Headers

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📞 Support

For API issues:
1. Check response status code
2. Review error message
3. Verify required fields
4. Check token validity
5. Ensure database connectivity
