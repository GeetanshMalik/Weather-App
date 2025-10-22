const Favorite = require('../models/Favorite');

const getAllFavorites = async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { city, country, lat, lon, userId } = req.body;

    if (!city || !country || !lat || !lon) {
      return res.status(400).json({ 
        error: 'City, country, latitude, and longitude are required' 
      });
    }

    const favorite = new Favorite({
      city,
      country,
      lat,
      lon,
      userId: userId || 'default'
    });

    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This city is already in your favorites' });
    }
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Favorite.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Favorite deleted successfully', deleted });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
};

module.exports = {
  getAllFavorites,
  addFavorite,
  deleteFavorite
};