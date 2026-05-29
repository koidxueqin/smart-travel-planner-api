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

module.exports = {
  buildWeatherRequestConfig
};