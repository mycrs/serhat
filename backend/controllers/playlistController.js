const Playlist = require('../models/Playlist');
const Channel = require('../models/Channel');
const Category = require('../models/Category');
const M3UParser = require('../utils/m3uParser');
const Joi = require('joi');

// Validation schemas
const playlistCreateSchema = Joi.object({
  name: Joi.string().required().trim(),
  url: Joi.string().uri().required(),
  description: Joi.string().allow(''),
  categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
  updateFrequency: Joi.string().valid('hourly', 'daily', 'weekly', 'manual').default('hourly')
});

const playlistUpdateSchema = Joi.object({
  name: Joi.string().trim(),
  url: Joi.string().uri(),
  description: Joi.string().allow(''),
  categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
  updateFrequency: Joi.string().valid('hourly', 'daily', 'weekly', 'manual'),
  isActive: Joi.boolean()
});

const playlistController = {
  // Get all playlists
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const playlists = await Playlist.find()
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Playlist.countDocuments();

      res.json({
        playlists,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single playlist
  async getById(req, res) {
    try {
      const playlist = await Playlist.findById(req.params.id)
        .populate('categoryId', 'name');
      
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }

      const channels = await Channel.find({ playlistId: playlist._id })
        .populate('categoryId', 'name');

      res.json({ playlist, channels });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new playlist
  async create(req, res) {
    try {
      const { error, value } = playlistCreateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if category exists
      if (value.categoryId) {
        const category = await Category.findById(value.categoryId);
        if (!category) {
          return res.status(400).json({ error: 'Category not found' });
        }
      }

      const playlist = new Playlist(value);
      await playlist.save();

      // Parse M3U and create channels
      try {
        await this.updatePlaylistChannels(playlist._id);
      } catch (parseError) {
        console.error('Failed to parse M3U during creation:', parseError);
        // Don't fail the playlist creation if parsing fails
      }

      const populatedPlaylist = await Playlist.findById(playlist._id)
        .populate('categoryId', 'name');

      res.status(201).json(populatedPlaylist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update playlist
  async update(req, res) {
    try {
      const { error, value } = playlistUpdateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if category exists
      if (value.categoryId) {
        const category = await Category.findById(value.categoryId);
        if (!category) {
          return res.status(400).json({ error: 'Category not found' });
        }
      }

      const playlist = await Playlist.findByIdAndUpdate(
        req.params.id,
        value,
        { new: true, runValidators: true }
      ).populate('categoryId', 'name');

      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }

      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete playlist
  async delete(req, res) {
    try {
      const playlist = await Playlist.findByIdAndDelete(req.params.id);
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }

      // Delete associated channels
      await Channel.deleteMany({ playlistId: req.params.id });

      res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Refresh playlist from M3U URL
  async refresh(req, res) {
    try {
      const playlist = await Playlist.findById(req.params.id);
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }

      await this.updatePlaylistChannels(playlist._id);
      
      const updatedPlaylist = await Playlist.findById(playlist._id)
        .populate('categoryId', 'name');

      res.json(updatedPlaylist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Helper method to update playlist channels
  async updatePlaylistChannels(playlistId) {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // Parse M3U content
    const channels = await M3UParser.parseFromUrl(playlist.url);

    // Delete existing channels
    await Channel.deleteMany({ playlistId: playlist._id });

    // Create new channels
    const channelDocs = channels.map(channel => ({
      ...channel,
      playlistId: playlist._id
    }));

    if (channelDocs.length > 0) {
      await Channel.insertMany(channelDocs);
    }

    // Update playlist stats
    playlist.channelCount = channelDocs.length;
    playlist.lastUpdated = new Date();
    await playlist.save();

    return channelDocs.length;
  }
};

module.exports = playlistController;