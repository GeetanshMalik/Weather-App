# Weather Forecast App

A full-stack weather application built with the MERN stack that provides real-time weather data and 5-day forecasts.

## Features

- Real-time weather information for any city
- 5-day weather forecast
- Geolocation support
- Save favorite cities
- Responsive design
- Search by city, state, and country

## Tech Stack

**Frontend:**
- React.js
- Lucide React (icons)
- CSS3

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose

**APIs:**
- OpenWeatherMap API

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- OpenWeatherMap API key

### Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
WEATHER_API_KEY=your_openweathermap_api_key
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5
```

Start server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

## Environment Variables

**Backend (.env):**
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `WEATHER_API_KEY` - OpenWeatherMap API key
- `WEATHER_API_BASE_URL` - Weather API base URL

**Frontend (Vercel):**
- `REACT_APP_WEATHER_API_KEY` - OpenWeatherMap API key

## Usage

1. Search for any city in the search bar
2. Use format: `City`, `City,Country` or `City,State,Country`
3. Click location icon to use current location
4. Add cities to favorites for quick access

## Deployment

**Frontend:** Deployed on Vercel  
**Backend:** Deployed on Render/Railway  
**Database:** MongoDB Atlas

## API Endpoints

- `GET /api/weather/current?city={city}` - Get current weather
- `GET /api/weather/forecast?city={city}` - Get 5-day forecast
- `GET /api/favorites` - Get all favorite cities
- `POST /api/favorites` - Add favorite city
- `DELETE /api/favorites/:id` - Remove favorite city
- `GET /api/history` - Get search history

## Screenshots

<img width="1352" height="927" alt="image" src="https://github.com/user-attachments/assets/645a7ff7-2682-4742-bc64-575b3ee5a406" />


## License

MIT

## Author

Geetansh Malik

## Acknowledgments

- OpenWeatherMap for weather data
- MongoDB Atlas for database hosting
- Vercel & Render for deployment
