const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    default: ''
  },
  group: {
    type: String,
    default: ''
  },
  playlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  isActive: {
    type: Boolean,
    default: true
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

channelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Channel', channelSchema);