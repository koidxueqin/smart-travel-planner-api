const axios = require("axios");
const AppError = require("../utils/AppError");

const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Check that OpenWeatherMap API key is available
function checkWeatherApiKey() {
  if (!process.env.OPENWEATHER_API_KEY) {
    throw new AppError("Weather service is not configured properly", 503);
  }
}

// Build the axios request configuration for OpenWeatherMap
function buildWeatherRequestConfig(destination) {
  checkWeatherApiKey();

  return {
    method: "GET",
    url: OPENWEATHER_BASE_URL,
    params: {
      q: destination.trim(),
      appid: process.env.OPENWEATHER_API_KEY,
      units: "metric"
    },
    timeout: 5000
  };
}

 // Validate important fields expected from OpenWeatherMap
function isValidWeatherData(weatherData) {
  return (
    weatherData &&
    weatherData.name &&
    weatherData.sys &&
    weatherData.sys.country &&
    weatherData.main &&
    typeof weatherData.main.temp !== "undefined" &&
    typeof weatherData.main.feels_like !== "undefined" &&
    typeof weatherData.main.humidity !== "undefined" &&
    Array.isArray(weatherData.weather) &&
    weatherData.weather.length > 0 &&
    weatherData.weather[0].description &&
    weatherData.wind &&
    typeof weatherData.wind.speed !== "undefined"
  );
}

// Convert the OpenWeatherMap response into clean format
function formatWeatherData(weatherData) {
  if (!isValidWeatherData(weatherData)) {
    throw new AppError("Unexpected weather data received", 502);
  }

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

// Convert OpenWeatherMap, timeout, and network errors into clear API responses
function handleOpenWeatherError(error) {
  if (error instanceof AppError) {
    throw error;
  }

  if (error.response) {
    const statusCode = error.response.status;

    if (statusCode === 400) {
      throw new AppError("Invalid city name", 400);
    }

    if (statusCode === 401) {
      throw new AppError("Weather service authentication failed", 502);
    }

    if (statusCode === 404) {
      throw new AppError("City not found", 404);
    }

    if (statusCode === 429) {
      throw new AppError("Weather service rate limit exceeded", 429);
    }

    if (statusCode >= 500) {
      throw new AppError("Weather service is currently unavailable", 503);
    }

    throw new AppError("Weather service returned an error", 502);
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    throw new AppError("Weather request timed out", 504);
  }

  if (
    error.code === "ENOTFOUND" ||
    error.code === "EAI_AGAIN" ||
    error.code === "ECONNREFUSED" ||
    error.code === "ECONNRESET" ||
    error.code === "ENETUNREACH"
  ) {
    throw new AppError("Unable to connect to weather service", 503);
  }

  throw new AppError("Unable to fetch weather data", 502);
}

// Fetch current weather data for a city 
async function getWeatherByCity(destination) {
  try {
    if (!destination || destination.trim() === "") {
      throw new AppError("City is required", 400);
    }

    const response = await axios(buildWeatherRequestConfig(destination));

    return formatWeatherData(response.data);
  } catch (error) {
    handleOpenWeatherError(error);
  }
}

module.exports = {
  getWeatherByCity
};