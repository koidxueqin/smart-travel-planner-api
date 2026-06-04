function getTemperatureCategory(temperature) {
  if (temperature <= 10) {
    return "Cold";
  }

  if (temperature <= 20) {
    return "Cool";
  }

  if (temperature < 30) {
    return "Warm";
  }

  return "Hot";
}

function getWeatherCondition(description) {
  const weatherDescription = description.toLowerCase();

  if (weatherDescription.includes("thunderstorm")) {
    return "Thunderstorm";
  }

  if (
    weatherDescription.includes("rain") ||
    weatherDescription.includes("drizzle")
  ) {
    return "Rain";
  }

  if (weatherDescription.includes("clear")) {
    return "Clear";
  }

  if (weatherDescription.includes("snow")) {
    return "Snow";
  }

  if (weatherDescription.includes("cloud")) {
    return "Clouds";
  }

  if (
    weatherDescription.includes("mist") ||
    weatherDescription.includes("fog") ||
    weatherDescription.includes("haze")
  ) {
    return "Low Visibility";
  }

  return "Normal";
}

function getTravelSuggestion(weatherCondition, temperatureCategory, windSpeed) {
  const isHighWind = windSpeed >= 10;

  if (weatherCondition === "Thunderstorm") {
    return "Thunderstorm conditions detected. Avoid outdoor activities and check local safety updates before travelling.";
  }

  if (weatherCondition === "Rain") {
    return "Rain is expected. Bring an umbrella and prepare indoor backup plans.";
  }

  if (isHighWind) {
    return "Wind speed is high. Use caution during outdoor activities and check local conditions before departure.";
  }

  if (weatherCondition === "Clear" && temperatureCategory === "Hot") {
    return "Clear and hot weather. Outdoor sightseeing is possible, but stay hydrated and use sun protection.";
  }

  if (weatherCondition === "Clear") {
    return "Clear weather is suitable for outdoor sightseeing. Check local conditions before departure.";
  }

  if (temperatureCategory === "Hot") {
    return "Hot weather detected. Stay hydrated, use sun protection, and avoid staying under direct sunlight for too long.";
  }

  if (temperatureCategory === "Cold") {
    return "Cold weather detected. Wear warm clothing and check local conditions before departure.";
  }

  return "Weather conditions are generally suitable for travel. Check local conditions before departure.";
}

function buildTravelSummary(weather) {
  const temperatureCategory = getTemperatureCategory(weather.temperature);
  const weatherCondition = getWeatherCondition(weather.description);

  const suggestion = getTravelSuggestion(
    weatherCondition,
    temperatureCategory,
    weather.windSpeed
  );

  return {
    temperatureCategory,
    weatherCondition,
    suggestion
  };
}

module.exports = {
  buildTravelSummary
};