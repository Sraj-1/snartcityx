# SmartCityX - Production-Grade MERN Smart City Platform

A full-stack application for reporting and managing city infrastructure issues with geospatial intelligence, real-time notifications, and admin analytics.

## 🎯 Features

- **Issue Reporting**: Citizens report infrastructure issues with photos and GPS coordinates
- **Geospatial Queries**: Find nearby issues, heatmaps, and spatial analysis
- **Real-time Updates**: Live map with dynamic markers and status changes
- **Role-Based Access**: User and Admin roles with different permissions
- **Image Upload**: Cloudinary integration for reliable image storage
- **Modern UI**: Glassmorphism design with Framer Motion animations
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Authentication**: JWT-based secure authentication

## 🛠 Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB with Geospatial Indexing
- JWT Authentication
- Cloudinary for image uploads
- Multer for file handling

**Frontend:**
- React 18 with Hooks
- TailwindCSS for styling
- Framer Motion for animations
- Google Maps API integration
- Axios for API calls

## 📋 Prerequisites

- Node.js v16+ (v18+ recommended)
- npm or yarn
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- Google Maps API key
- Git

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repo-url>
cd SmartCityX
npm run install-all
```

### 2. Environment Setup

**Backend (.env in `/server`)**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartcityx
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Frontend (.env.local in `/client`)**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_APP_NAME=SmartCityX
```

### 3. MongoDB Setup

1. Create MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string (looks like: `mongodb+srv://...`)
3. Whitelist your IP or allow all
4. Add to .env file

### 4. Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Get API credentials from Settings > API Keys
3. Add to backend .env

### 5. Google Maps API

1. Create project at Google Cloud Console
2. Enable Maps JavaScript API
3. Create API key with restrictions
4. Add to frontend .env

### 6. Run Development Servers

```bash
npm run dev
```

This starts:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## 📁 Project Structure

```
SmartCityX/
├── server/                          # Backend
│   ├── src/
│   │   ├── config/                 # Database, JWT, Cloudinary config
│   │   ├── controllers/            # Route handlers (issues, auth, users)
│   │   ├── middlewares/            # Auth, error handling, validation
│   │   ├── models/                 # MongoDB schemas (User, Issue, etc)
│   │   ├── routes/                 # API routes
│   │   ├── utils/                  # Helpers, API responses, validators
│   │   └── app.js                  # Express app setup
│   ├── server.js                   # Entry point
│   ├── .env                        # Environment variables
│   └── package.json
│
├── client/                          # Frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── Common/            # Navbar, Footer, Loading
│   │   │   ├── Auth/              # Login, Register, ProtectedRoute
│   │   │   ├── Issues/            # IssueForm, IssueList, IssueCard
│   │   │   ├── Map/               # GoogleMap, MarkerCluster
│   │   │   ├── Admin/             # Dashboard, IssueStatus, Analytics
│   │   │   └── UI/                # Modal, Button, Input components
│   │   ├── pages/                 # Page components
│   │   ├── hooks/                 # Custom hooks (useAuth, useGeo, etc)
│   │   ├── api/                   # API client setup and methods
│   │   ├── store/                 # Zustand state management
│   │   ├── styles/                # Global styles, animations
│   │   ├── utils/                 # Helpers, validators, constants
│   │   ├── App.jsx                # Root component
│   │   └── main.jsx               # Entry point
│   ├── .env.local                 # Environment variables
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh JWT token

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create issue (auth required)
- `PUT /api/issues/:id` - Update issue (auth + owner/admin)
- `DELETE /api/issues/:id` - Delete issue (auth + admin)
- `GET /api/issues/nearby/:lat/:lng` - Get nearby issues (5km radius)
- `GET /api/issues/filter?category=...&status=...` - Filter issues

### Admin
- `GET /api/admin/statistics` - Dashboard stats
- `GET /api/admin/heatmap` - Heatmap data
- `PUT /api/admin/issues/:id/status` - Update issue status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/my-issues` - Get user's issues

## 🎨 UI Components

### Pre-built Components
- **AuthForm** - Login/Register with validation
- **IssueForm** - Report issue with image upload and GPS
- **IssueCard** - Display issue details with animations
- **GoogleMap** - Interactive map with markers
- **AdminDashboard** - Stats and issue management
- **StatusBadge** - Issue status with color coding
- **LoadingSpinner** - Beautiful loading state
- **ErrorBoundary** - Graceful error handling

### Design System
- **Glassmorphism**: Frosted glass effect backgrounds
- **Gradients**: Subtle gradient overlays
- **Animations**: Smooth Framer Motion transitions
- **Colors**: 
  - Primary: Blue-600 (#2563eb)
  - Success: Green-500 (#22c55e)
  - Warning: Amber-500 (#f59e0b)
  - Danger: Red-500 (#ef4444)

## 🔄 Data Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['user', 'admin'],
  avatar: String (Cloudinary URL),
  location: Point (GeoJSON),
  createdAt: Date
}
```

### Issue Schema
```javascript
{
  title: String,
  description: String,
  category: Enum ['pothole', 'traffic_light', 'street_light', 'other'],
  status: Enum ['reported', 'in_progress', 'resolved', 'rejected'],
  location: Point (GeoJSON),
  address: String,
  image: String (Cloudinary URL),
  reporter: ObjectId (User ref),
  severity: Enum ['low', 'medium', 'high'],
  upvotes: Number,
  comments: [{ user: ObjectId, text: String, date: Date }],
  updatedBy: ObjectId (Admin ref),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚨 Error Handling

All endpoints return consistent error responses:
```javascript
{
  success: false,
  status: 400,
  message: "Error description",
  errors: { field: "error message" } // Optional, for validation
}
```

## 🧪 Testing

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

## 📦 Deployment

### Heroku/Render Backend
```bash
# Push to production
git push heroku main

# Or use Render dashboard
```

### Vercel Frontend
```bash
# Connect GitHub repo to Vercel
# Auto-deploys on push to main
```

### Docker

```dockerfile
# Build backend
docker build -t smartcityx-server ./server

# Build frontend
docker build -t smartcityx-client ./client

# Run with docker-compose
docker-compose up
```

## 📚 Additional Resources

- MongoDB Geospatial: https://docs.mongodb.com/manual/geospatial-queries/
- Google Maps API: https://developers.google.com/maps
- Cloudinary Docs: https://cloudinary.com/documentation
- Express.js: https://expressjs.com/
- React: https://react.dev/

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/amazing`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing`)
4. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 📞 Support

For issues and questions, please open a GitHub issue or contact the team.

---

**Happy coding! 🚀**
