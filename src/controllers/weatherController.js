const weatherService = require("../services/weatherService");
const AppError = require("../utils/AppError");

async function getWeather(req, res, next) {
  try {
    const { city } = req.query;

    if (!city || city.trim() === "") {
      throw new AppError("City is required", 400);
    }

    const weather = await weatherService.getWeatherByCity(city.trim());

    return res.status(200).json({
      success: true,
      message: "Weather fetched successfully",
      data: weather
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWeather
};