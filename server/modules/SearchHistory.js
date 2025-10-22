const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    default: 'default'
  },
  searchDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
