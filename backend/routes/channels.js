const express = require('express');
const channelController = require('../controllers/channelController');
const router = express.Router();

// GET /api/channels - Get all channels with filtering
router.get('/', channelController.getAll);

// GET /api/channels/:id - Get single channel
router.get('/:id', channelController.getById);

// PUT /api/channels/:id - Update channel
router.put('/:id', channelController.update);

// DELETE /api/channels/:id - Delete channel
router.delete('/:id', channelController.delete);

module.exports = router;