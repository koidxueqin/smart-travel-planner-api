const axios = require("axios");
const AppError = require("../utils/AppError");

const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

function checkWeatherApiKey() {
  if (!process.env.OPENWEATHER_API_KEY) {
    throw new AppError("OpenWeatherMap API key is missing", 500);
  }
}

function buildWeatherRequestConfig(destination) {
  checkWeatherApiKey();

  return {
    method: "GET",
    url: OPENWEATHER_BASE_URL,
    params: {
      q: destination,
      appid: process.env.OPENWEATHER_API_KEY,
      units: "metric"
    },
    timeout: 5000
  };
}

function formatWeatherData(weatherData) {
  return {
    city: weatherData.name,
    country: weatherData.sys.country,
    temperature: weatherData.main.temp,
    feelsLike: weatherData.main.feels_like,
    description: weatherData.weather[0].description,
    humidity: weatherData.main.humidity,
    windSpeed: weatherData.wind.speed
  };
}

async function getWeatherByCity(destination) {
  try {
    const response = await axios(buildWeatherRequestConfig(destination));

    return formatWeatherData(response.data);
  } catch (error) {
    if (error.response) {
      const statusCode = error.response.status;

      if (statusCode === 401) {
        throw new AppError("Invalid OpenWeatherMap API key", 500);
      }

      if (statusCode === 404) {
        throw new AppError("City not found", 404);
      }

      if (statusCode === 429) {
        throw new AppError("OpenWeatherMap rate limit exceeded", 429);
      }

      throw new AppError("OpenWeatherMap API error", 502);
    }

    if (error.code === "ECONNABORTED") {
      throw new AppError("Weather request timed out", 504);
    }

    throw new AppError("Unable to fetch weather data", 502);
  }
}

module.exports = {
  getWeatherByCity
};