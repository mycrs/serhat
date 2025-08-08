# Production Deployment Guide

## Environment Setup

### Environment Variables

#### Backend (.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/serhat_m3u
NODE_ENV=production
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
```

## Deployment Options

### 1. Docker Deployment

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    restart: always
    environment:
      MONGO_INITDB_DATABASE: serhat_m3u
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    restart: always
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/serhat_m3u
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    restart: always
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### 2. Traditional VPS Deployment

1. **Install dependencies**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y mongodb
   ```

2. **Clone and setup**:
   ```bash
   git clone https://github.com/mycrs/serhat.git
   cd serhat
   ./setup.sh
   ```

3. **Build and start**:
   ```bash
   cd frontend && npm run build
   cd ../backend && npm start
   cd ../frontend && npm start
   ```

### 3. Cloud Deployment (Vercel + MongoDB Atlas)

1. **Frontend (Vercel)**:
   - Connect GitHub repository to Vercel
   - Set build command: `cd frontend && npm run build`
   - Set environment variable: `NEXT_PUBLIC_API_BASE_URL`

2. **Backend (Railway/Heroku)**:
   - Deploy backend folder separately
   - Set environment variables in platform dashboard
   - Use MongoDB Atlas for database

3. **Database (MongoDB Atlas)**:
   - Create free cluster at mongodb.com
   - Get connection string
   - Update MONGODB_URI in backend environment

## Production Considerations

### Security
- Enable CORS only for your domain
- Add rate limiting middleware
- Use HTTPS in production
- Validate all inputs
- Sanitize M3U URLs

### Performance
- Enable MongoDB indexing
- Add Redis for caching
- Use CDN for frontend assets
- Implement pagination for large datasets
- Add database connection pooling

### Monitoring
- Add logging middleware
- Set up error tracking (Sentry)
- Monitor cron job execution
- Track API response times
- Monitor database performance

### Backup
- Schedule regular MongoDB backups
- Store M3U playlist data redundantly
- Keep application logs
- Version control configuration changes