import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Heart, Search, MapPin, Trash2 } from 'lucide-react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = 'cbf1b77b6b8ba87ecad51b3d17b6ae60'; // Replace with your actual API key
  const API_BASE = 'https://api.openweathermap.org/data/2.5';

  useEffect(() => {
    const saved = JSON.parse(window.savedFavorites || '[]');
    setFavorites(saved);
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Geolocation error:', error);
          fetchWeather('London');
        }
      );
    } else {
      fetchWeather('London');
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const weatherRes = await fetch(
        `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const forecastRes = await fetch(
        `${API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      if (!weatherRes.ok) throw new Error('Location not found');

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();

      setWeather(weatherData);
      processForecast(forecastData.list);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchWeather = async (cityName) => {
  if (!cityName.trim()) return;
  
  setLoading(true);
  setError('');
  try {
    // Support formats: "City", "City,Country", "City,State,Country"
    const searchQuery = cityName.trim();
    
    const weatherRes = await fetch(
      `${API_BASE}/weather?q=${encodeURIComponent(searchQuery)}&appid=${API_KEY}&units=metric`
    );
    const forecastRes = await fetch(
      `${API_BASE}/forecast?q=${encodeURIComponent(searchQuery)}&appid=${API_KEY}&units=metric`
    );

    if (!weatherRes.ok) {
      throw new Error(`City not found. Try: "City,State,Country" format (e.g., "Ashta,MP,IN")`);
    }

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    setWeather(weatherData);
    processForecast(forecastData.list);
    setCity(''); // Clear search box
  } catch (err) {
    setError(err.message);
  }
  setLoading(false);
};

  const processForecast = (list) => {
    const daily = [];
    const days = {};

    list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!days[date]) {
        days[date] = item;
        daily.push(item);
      }
    });

    setForecast(daily.slice(0, 5));
  };

  const handleSearch = () => {
    fetchWeather(city);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addToFavorites = () => {
    if (!weather) return;
    const newFav = {
      id: Date.now(),
      city: weather.name,
      country: weather.sys.country,
      lat: weather.coord.lat,
      lon: weather.coord.lon
    };
    
    if (favorites.some(f => f.city === newFav.city)) {
      alert('City already in favorites!');
      return;
    }

    const updated = [...favorites, newFav];
    setFavorites(updated);
    window.savedFavorites = JSON.stringify(updated);
  };

  const removeFavorite = (id) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    window.savedFavorites = JSON.stringify(updated);
  };

  const loadFavorite = (fav) => {
    fetchWeatherByCoords(fav.lat, fav.lon);
  };

  const getWeatherIcon = (iconCode) => {
    if (iconCode.includes('01')) return <Sun size={64} />;
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) 
      return <Cloud size={64} />;
    if (iconCode.includes('09') || iconCode.includes('10')) 
      return <CloudRain size={64} />;
    return <Cloud size={64} />;
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Weather Forecast</h1>
          <p>Get real-time weather information</p>
        </div>

        <div className="search-box">
          <div className="search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search for a city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input"
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
            <button onClick={getCurrentLocation} className="btn btn-secondary" title="Use current location">
              <MapPin size={20} />
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {loading && <div className="loading">Loading weather data...</div>}

        {weather && !loading && (
          <div className="weather-grid">
            <div className="weather-card">
              <div className="weather-header">
                <div>
                  <h2>{weather.name}, {weather.sys.country}</h2>
                  <p style={{fontSize: '14px', color: '#9ca3af'}}> Coordinates: {weather.coord.lat.toFixed(2)}°, {weather.coord.lon.toFixed(2)}° </p>
                  <p className="weather-description">{weather.weather[0].description}</p>
                </div>
                <button onClick={addToFavorites} className="btn-favorite" title="Add to favorites">
                  <Heart size={24} />
                </button>
              </div>

              <div className="weather-main">
                <div className="temp-display">
                  {getWeatherIcon(weather.weather[0].icon)}
                  <div className="temp-large">{Math.round(weather.main.temp)}°C</div>
                </div>
                <div className="feels-like">
                  <p className="feels-like-label">Feels like</p>
                  <p className="feels-like-temp">{Math.round(weather.main.feels_like)}°C</p>
                </div>
              </div>

              <div className="weather-details">
                <div className="detail-card">
                  <div className="detail-header">
                    <Wind className="detail-icon" size={20} />
                    <span className="detail-label">Wind</span>
                  </div>
                  <p className="detail-value">{weather.wind.speed} m/s</p>
                </div>

                <div className="detail-card">
                  <div className="detail-header">
                    <Droplets className="detail-icon" size={20} />
                    <span className="detail-label">Humidity</span>
                  </div>
                  <p className="detail-value">{weather.main.humidity}%</p>
                </div>

                <div className="detail-card">
                  <div className="detail-header">
                    <Eye className="detail-icon" size={20} />
                    <span className="detail-label">Visibility</span>
                  </div>
                  <p className="detail-value">{(weather.visibility / 1000).toFixed(1)} km</p>
                </div>

                <div className="detail-card">
                  <div className="detail-header">
                    <Gauge className="detail-icon" size={20} />
                    <span className="detail-label">Pressure</span>
                  </div>
                  <p className="detail-value">{weather.main.pressure} hPa</p>
                </div>
              </div>
            </div>

            <div className="favorites-card">
              <h3>Favorite Cities</h3>
              {favorites.length === 0 ? (
                <p className="favorites-empty">No favorites yet</p>
              ) : (
                <div>
                  {favorites.map(fav => (
                    <div key={fav.id} className="favorite-item">
                      <div onClick={() => loadFavorite(fav)} className="favorite-info">
                        <p className="favorite-city">{fav.city}</p>
                        <p className="favorite-country">{fav.country}</p>
                      </div>
                      <button onClick={() => removeFavorite(fav.id)} className="btn-delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {forecast.length > 0 && !loading && (
          <div className="forecast-card">
            <h3>5-Day Forecast</h3>
            <div className="forecast-grid">
              {forecast.map((day, idx) => (
                <div key={idx} className="forecast-day">
                  <p className="forecast-day-name">
                    {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <div className="forecast-icon">{getWeatherIcon(day.weather[0].icon)}</div>
                  <p className="forecast-temp">{Math.round(day.main.temp)}°C</p>
                  <p className="forecast-description">{day.weather[0].description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!weather && !loading && (
          <div className="welcome-card">
            <div className="welcome-icon"><Cloud size={96} /></div>
            <h3>Welcome to Weather Forecast</h3>
            <p>Search for a city or use your current location to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;