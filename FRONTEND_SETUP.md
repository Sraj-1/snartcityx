# SmartCityX Frontend Setup Guide

## Prerequisites

- Node.js v16+ (v18+ recommended)
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Install Dependencies

```bash
cd client
npm install
```

This installs:
- React 18
- Vite (fast build tool)
- TailwindCSS
- Framer Motion
- Zustand (state management)
- Axios (HTTP client)

### 2. Environment Configuration

Create `.env.local` file in the `client` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_APP_NAME=SmartCityX
```

### 3. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create API key (restrict to JavaScript)
5. Add to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

The app will auto-reload on file changes.

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Auth/              # Login/Register
│   │   ├── Common/            # Navbar, Loading
│   │   ├── Issues/            # Issue card, list
│   │   ├── Map/               # Google Maps
│   │   └── Admin/             # Admin components
│   ├── pages/                 # Page components
│   ├── api/                   # API client
│   ├── store/                 # Zustand stores
│   ├── styles/                # CSS & animations
│   ├── utils/                 # Helpers
│   ├── App.jsx                # Root component
│   └── main.jsx               # Entry point
├── index.html                 # HTML template
├── vite.config.js             # Vite config
├── tailwind.config.js         # Tailwind config
├── postcss.config.js          # PostCSS config
└── package.json
```

## Key Features

✅ Responsive Design
✅ Dark Mode Support
✅ Real-time Issue Updates
✅ Geolocation Integration
✅ Image Upload & Preview
✅ Smooth Animations
✅ State Management with Zustand
✅ Form Validation
✅ Error Handling
✅ Admin Dashboard

## Available Routes

| Route | Purpose | Auth Required |
|-------|---------|---|
| `/` | Homepage with issue list | No |
| `/login` | User login | No |
| `/register` | New user registration | No |
| `/report` | Report new issue | Yes |
| `/admin` | Admin dashboard | Yes (Admin) |

## Component Architecture

### Pages
- `HomePage` - Main dashboard with issues
- `LoginPage` - User authentication
- `RegisterPage` - User registration
- `ReportIssuePage` - Issue reporting form
- `AdminDashboardPage` - Admin statistics

### Components
- `Navbar` - Navigation with user menu
- `IssueCard` - Display individual issue
- `LoadingSpinner` - Loading state
- `ProtectedRoute` - Route guard

### Hooks (Custom)
- `useAuthStore` - Authentication state
- `useIssuesStore` - Issues state management

## Styling System

### TailwindCSS Classes

```jsx
// Buttons
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>

// Inputs
<input className="input-base" />

// Glassmorphism
<div className="glassmorphism p-4">...</div>

// Animations
<div className="animate-fade-in">...</div>
<div className="animate-slide-up">...</div>
```

### CSS Variables

```css
--primary: #2563eb
--success: #22c55e
--warning: #f59e0b
--danger: #ef4444
--bg-primary: #ffffff
--text-primary: #1f2937
```

## State Management with Zustand

### Auth Store

```javascript
import { useAuthStore } from './store/authStore'

const MyComponent = () => {
  const { user, login, logout } = useAuthStore()
  
  return (
    <div>
      {user && <p>Hello, {user.name}</p>}
    </div>
  )
}
```

### Issues Store

```javascript
import { useIssuesStore } from './store/issuesStore'

const MyComponent = () => {
  const { issues, fetchIssues, createIssue } = useIssuesStore()
  
  useEffect(() => {
    fetchIssues()
  }, [])
  
  return (
    <div>
      {issues.map(issue => (
        <div key={issue._id}>{issue.title}</div>
      ))}
    </div>
  )
}
```

## API Integration

All API calls go through `src/api/client.js`:

```javascript
import { issuesAPI, authAPI, adminAPI } from './api/client'

// Issues
await issuesAPI.getAll(filters)
await issuesAPI.create(formData)
await issuesAPI.getNearby(lat, lng)

// Auth
await authAPI.login(credentials)
await authAPI.register(userData)

// Admin
await adminAPI.getStats()
await adminAPI.getAnalytics(days)
```

## Form Handling

All forms include:
- Input validation
- Error messages
- Loading states
- Submit handling

Example:

```jsx
const [formData, setFormData] = useState({...})
const [errors, setErrors] = useState({})
const [loading, setLoading] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!validateForm()) return
  
  setLoading(true)
  try {
    await api.post('/endpoint', formData)
  } catch (err) {
    setErrors(err.response.data.errors)
  } finally {
    setLoading(false)
  }
}
```

## Animations with Framer Motion

```jsx
import { motion } from 'framer-motion'

// Simple fade-in
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

// Staggered list
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
/>

// Hover effect
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />
```

## Building for Production

```bash
npm run build
```

Creates optimized bundle in `dist/` directory.

Deploy to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# With custom domain
vercel --prod
```

Or connect GitHub repo to Vercel dashboard for auto-deploy.

## Environment Variables

### Development
```env
VITE_API_BASE_URL=http://localhost:5000
```

### Production
```env
VITE_API_BASE_URL=https://api.smartcityx.com
```

## Performance Optimization

1. **Code Splitting** - React lazy loading
2. **Image Optimization** - Cloudinary provides responsive images
3. **Caching** - Browser cache for assets
4. **Minification** - Vite handles this
5. **Tree Shaking** - Unused code removal

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Blank Page on Load
- Check browser console for errors
- Verify `VITE_API_BASE_URL` in `.env.local`
- Ensure backend is running

### API Requests Failing
```
CORS error: Access denied
```
Solution: Add frontend URL to backend `ALLOWED_ORIGINS`

### Images Not Loading
- Verify Cloudinary configuration
- Check image URLs in network tab
- Ensure image upload was successful

### State Not Persisting
- Check localStorage in browser DevTools
- Verify Zustand store setup
- Clear localStorage and retry

### Styling Issues
- Run `npm install` to ensure TailwindCSS installed
- Check `tailwind.config.js` for content paths
- Clear browser cache

## Development Tools

### Recommended Extensions
- React Developer Tools
- Redux DevTools
- Tailwind CSS IntelliSense
- ES7+ React/Redux Snippets

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Testing

```bash
npm run test
```

## Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Run tests
npm run test
```

## Resources

- Vite: https://vitejs.dev
- React: https://react.dev
- TailwindCSS: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion
- Zustand: https://github.com/pmndrs/zustand
- Axios: https://axios-http.com
