const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lon: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    default: 'default'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

FavoriteSchema.index({ city: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
