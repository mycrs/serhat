const Channel = require('../models/Channel');
const Joi = require('joi');

const channelUpdateSchema = Joi.object({
  name: Joi.string().trim(),
  categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
  isActive: Joi.boolean()
});

const channelController = {
  // Get all channels with filtering
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      const filter = {};
      if (req.query.playlistId) {
        filter.playlistId = req.query.playlistId;
      }
      if (req.query.categoryId) {
        filter.categoryId = req.query.categoryId;
      }
      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
      }

      const channels = await Channel.find(filter)
        .populate('playlistId', 'name')
        .populate('categoryId', 'name')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

      const total = await Channel.countDocuments(filter);

      res.json({
        channels,
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

  // Get single channel
  async getById(req, res) {
    try {
      const channel = await Channel.findById(req.params.id)
        .populate('playlistId', 'name')
        .populate('categoryId', 'name');
      
      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
      }

      res.json(channel);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update channel
  async update(req, res) {
    try {
      const { error, value } = channelUpdateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const channel = await Channel.findByIdAndUpdate(
        req.params.id,
        value,
        { new: true, runValidators: true }
      )
      .populate('playlistId', 'name')
      .populate('categoryId', 'name');

      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
      }

      res.json(channel);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete channel
  async delete(req, res) {
    try {
      const channel = await Channel.findByIdAndDelete(req.params.id);
      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
      }

      res.json({ message: 'Channel deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = channelController;