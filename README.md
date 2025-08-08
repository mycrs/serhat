# Serhat M3U Admin Panel

A comprehensive admin panel for managing M3U playlists with hourly updates, built with Node.js/Express backend and React/Next.js frontend.

## Features

- **Visual Playlist Management**: Clean interface to view and manage M3U playlists
- **Automatic Updates**: Hourly cron jobs to refresh playlist content  
- **Category Organization**: Organize playlists and channels into categories
- **Channel Browsing**: Browse all channels from your playlists with filtering
- **Real-time Parsing**: M3U files are parsed and channels extracted automatically
- **Admin Control**: Full CRUD operations for playlists, categories, and channels

## Tech Stack

### Backend
- Node.js/Express
- MongoDB with Mongoose
- Cron jobs for scheduled updates
- Custom M3U parser
- RESTful API with validation

### Frontend  
- React/Next.js
- Tailwind CSS for styling
- Axios for API calls
- React Hot Toast for notifications

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mycrs/serhat.git
cd serhat
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB connection string
```

4. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend API on http://localhost:5000
- Frontend on http://localhost:3000

## API Endpoints

### Playlists
- `GET /api/playlists` - Get all playlists
- `POST /api/playlists` - Create new playlist  
- `GET /api/playlists/:id` - Get single playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/refresh` - Refresh playlist from M3U URL

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Channels
- `GET /api/channels` - Get all channels (with filtering)
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel

## Database Schema

### Playlist
- name, url, description
- categoryId (optional)
- channelCount, lastUpdated
- updateFrequency (hourly/daily/weekly/manual)
- isActive

### Category  
- name, description
- createdAt, updatedAt

### Channel
- name, url, logo, group
- playlistId, categoryId (optional)
- isActive

## Usage

1. **Create Categories**: Organize your content by creating categories
2. **Add Playlists**: Upload M3U playlist URLs and assign categories
3. **Browse Channels**: View all channels extracted from your playlists
4. **Manage Updates**: Configure automatic hourly updates or refresh manually

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request