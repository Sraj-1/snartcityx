# SmartCityX Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### Backend
- [ ] All environment variables configured
- [ ] MongoDB Atlas cluster created
- [ ] Cloudinary account setup
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] NODE_ENV=production set
- [ ] CORS origins restricted to your domain
- [ ] SSL/TLS certificates ready
- [ ] Database backups configured
- [ ] Error monitoring (Sentry) configured
- [ ] Rate limiting enabled
- [ ] Tests passing

### Frontend
- [ ] API_BASE_URL points to production backend
- [ ] Google Maps API key configured
- [ ] Build optimization reviewed
- [ ] Analytics/tracking setup (optional)
- [ ] Service worker configured
- [ ] SEO meta tags added
- [ ] Tests passing
- [ ] Build size checked

---

## 🌐 Deploy Backend to Heroku

### 1. Prerequisites
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

### 2. Create Heroku App
```bash
cd server

# Create app (choose unique name)
heroku create smartcityx-api-prod

# Add MongoDB URI
heroku config:set MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/smartcityx"

# Add other variables
heroku config:set JWT_SECRET="your_super_secret_key_32_chars_min"
heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud_name"
heroku config:set CLOUDINARY_API_KEY="your_key"
heroku config:set CLOUDINARY_API_SECRET="your_secret"
heroku config:set ALLOWED_ORIGINS="https://smartcityx.com"
heroku config:set NODE_ENV="production"
heroku config:set PORT="5000"
```

### 3. Configure Procfile
Create `Procfile` in server root:
```
web: node server.js
```

### 4. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# View logs
heroku logs --tail

# Open app
heroku open
```

### 5. Verify Deployment
```bash
curl https://smartcityx-api-prod.herokuapp.com/api/health
```

---

## ☁️ Deploy Backend to Render

### 1. Connect GitHub
- Go to [Render.com](https://render.com)
- Sign in with GitHub
- Create new Web Service
- Select your repository

### 2. Configure Service
```
Name: smartcityx-api
Environment: Node
Build Command: npm install
Start Command: npm start
```

### 3. Environment Variables
Add in Render dashboard:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ALLOWED_ORIGINS=https://smartcityx.com
NODE_ENV=production
```

### 4. Deploy
Push to main branch - auto-deploys!

---

## 🎨 Deploy Frontend to Vercel

### Option A: Using Vercel CLI

```bash
cd client

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option B: GitHub Integration (Recommended)

1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select SmartCityX repository
5. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://smartcityx-api-prod.herokuapp.com
   VITE_GOOGLE_MAPS_API_KEY=your_key
   ```

7. Deploy!

### Option C: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 🐳 Docker Deployment

### Create Backend Dockerfile

`server/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["node", "server.js"]
```

### Create Frontend Dockerfile

`client/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Create Docker Compose

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/smartcityx?authSource=admin
      JWT_SECRET: your_secret_key
      NODE_ENV: production
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
```

### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## ☸️ Kubernetes Deployment

### Create Backend Deployment

`k8s/backend-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smartcityx-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: smartcityx-backend
  template:
    metadata:
      labels:
        app: smartcityx-backend
    spec:
      containers:
      - name: backend
        image: smartcityx-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: smartcityx-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: smartcityx-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Create Service

`k8s/backend-service.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: smartcityx-backend
spec:
  type: LoadBalancer
  selector:
    app: smartcityx-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
```

### Deploy
```bash
kubectl apply -f k8s/

# Verify
kubectl get deployments
kubectl get services
```

---

## 🔒 HTTPS/SSL Setup

### Using Let's Encrypt with Nginx

```nginx
server {
    listen 80;
    server_name api.smartcityx.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.smartcityx.com;

    ssl_certificate /etc/letsencrypt/live/api.smartcityx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.smartcityx.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Certbot Installation
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.smartcityx.com
sudo systemctl restart nginx
```

---

## 📦 Database Backup Strategy

### MongoDB Atlas Automatic Backups
1. Go to MongoDB Atlas Dashboard
2. Project → Backup
3. Enable "Continuous Backup"
4. Retention: 35 days

### Manual Backup Script

`backup.sh`:
```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/smartcityx"
MONGODB_URI=$1

mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/backup_$DATE

# Keep only last 7 backups
ls -t $BACKUP_DIR | tail -n +8 | xargs -I {} rm -rf $BACKUP_DIR/{}

echo "Backup completed: $BACKUP_DIR/backup_$DATE"
```

### Scheduled Backups (Cron)
```bash
# Daily backup at 2 AM
0 2 * * * /scripts/backup.sh "$MONGODB_URI" >> /var/log/backup.log 2>&1
```

---

## 📊 Monitoring & Alerts

### Application Monitoring with Datadog

```javascript
// server/src/app.js
import { tracer } from 'dd-trace';

tracer.init();

app.use(tracer.express.middleware);
```

### Error Tracking with Sentry

```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

app.use(Sentry.Handlers.errorHandler());
```

### Custom Alerts (Email)

```javascript
// Email on critical error
Sentry.captureException(error, {
  level: 'critical',
  context: {
    userId: req.user?.userId,
    endpoint: req.path
  }
});
```

---

## 🔍 Performance Optimization

### Frontend Performance Checklist

```bash
# Build analysis
npm run build
npx vite-plugin-visualizer

# Lighthouse audit
# - Run in Chrome DevTools
# - Target: 90+ scores
```

### Backend Performance

1. **Enable GZIP Compression**
```javascript
import compression from 'compression';
app.use(compression());
```

2. **Use CDN for Static Assets**
```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));
```

3. **Database Connection Pooling**
```javascript
// MongoDB auto-pools connections
// Default: 100 connections
```

---

## 🔐 Security Hardening

### Checklist
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] HSTS header set
- [ ] CORS restricted to your domains
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] No sensitive data in logs
- [ ] Regular dependency updates
- [ ] Security headers configured (Helmet)
- [ ] DDoS protection (Cloudflare)
- [ ] Database credentials secured

### Security Headers

```javascript
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", process.env.API_BASE_URL]
  }
}));
```

---

## 📈 Scaling for Growth

### Phase 1 (0-1000 users)
- Single server
- Shared MongoDB
- CDN for frontend

### Phase 2 (1000-10000 users)
- Load balancer (2+ backend instances)
- Database read replicas
- Redis caching

### Phase 3 (10000+ users)
- Kubernetes cluster
- Database sharding
- Microservices
- Message queues (RabbitMQ)

---

## 🆘 Troubleshooting Deployment

### CORS Errors
```bash
# Add your frontend domain to ALLOWED_ORIGINS
heroku config:set ALLOWED_ORIGINS="https://smartcityx.com,https://www.smartcityx.com"
```

### Database Connection Issues
```bash
# Verify connection string
heroku config | grep MONGODB_URI

# Test connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/smartcityx"
```

### Memory Issues
```bash
# Increase dyno size
heroku dyno:resize standard-1x -a smartcityx-api-prod

# Monitor memory
heroku logs --dyno web -a smartcityx-api-prod | grep memory
```

### Build Failures
```bash
# Clear build cache
heroku builds:cancel -a smartcityx-api-prod

# Rebuild
git push heroku main --force
```

---

## 📞 Support Resources

- Heroku Docs: https://devcenter.heroku.com
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Docker: https://docs.docker.com
- Kubernetes: https://kubernetes.io/docs

---

**Production deployment complete! Your SmartCityX is live! 🎉**
