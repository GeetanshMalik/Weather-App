const axios = require('axios');
const SearchHistory = require('../models/SearchHistory');

const getCurrentWeather = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({ 
        error: 'Please provide either city name or coordinates (lat, lon)' 
      });
    }

    let url = `${process.env.WEATHER_API_BASE_URL}/weather?appid=${process.env.WEATHER_API_KEY}&units=metric`;

    if (city) {
      url += `&q=${encodeURIComponent(city)}`;
    } else {
      url += `&lat=${lat}&lon=${lon}`;
    }

    const response = await axios.get(url);
    
    if (response.data) {
      const history = new SearchHistory({
        city: response.data.name,
        country: response.data.sys.country,
        userId: req.query.userId || 'default'
      });
      await history.save().catch(err => console.log('History save error:', err));
    }

    res.json(response.data);
  } catch (error) {
    console.error('Weather API Error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({ 
        error: error.response.data.message || 'City not found' 
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
};

const getForecast = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({ 
        error: 'Please provide either city name or coordinates (lat, lon)' 
      });
    }

    let url = `${process.env.WEATHER_API_BASE_URL}/forecast?appid=${process.env.WEATHER_API_KEY}&units=metric`;

    if (city) {
      url += `&q=${encodeURIComponent(city)}`;
    } else {
      url += `&lat=${lat}&lon=${lon}`;
    }

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Forecast API Error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({ 
        error: error.response.data.message || 'Forecast not available' 
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
  }
};

module.exports = {
  getCurrentWeather,
  getForecast
};