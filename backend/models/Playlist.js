const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  channelCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updateFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'manual'],
    default: 'hourly'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

playlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Playlist', playlistSchema);