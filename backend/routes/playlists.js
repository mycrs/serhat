const express = require('express');
const playlistController = require('../controllers/playlistController');
const router = express.Router();

// GET /api/playlists - Get all playlists
router.get('/', playlistController.getAll);

// GET /api/playlists/:id - Get single playlist
router.get('/:id', playlistController.getById);

// POST /api/playlists - Create new playlist
router.post('/', playlistController.create);

// PUT /api/playlists/:id - Update playlist
router.put('/:id', playlistController.update);

// DELETE /api/playlists/:id - Delete playlist
router.delete('/:id', playlistController.delete);

// POST /api/playlists/:id/refresh - Refresh playlist from M3U URL
router.post('/:id/refresh', playlistController.refresh);

module.exports = router;