# Smart Travel Planner API

A backend-only REST API for a Smart Travel Planner project.

The system allows users to register, log in, manage their own travel records, and combine saved trip data with real-time weather data from OpenWeatherMap.

## Project Overview

This project demonstrates a Smart Travel Planner system that combines:

1. A self-developed REST API for managing user-specific travel records
2. A third-party API integration for real-time weather data

The API stores users and trips in SQLite. Users can create and manage their own trips, then fetch weather information and a rule-based travel summary for saved destinations.

## Project Type

Backend-only REST API tested using:

* Postman
* Jest
* Supertest

## Technology Stack

* Node.js
* Express.js
* SQLite
* OpenWeatherMap API
* Postman
* Jest and Supertest
* dotenv
* helmet
* express-rate-limit
* cors
* morgan
* zod
* bcrypt
* jsonwebtoken
* nodemon

## Main Features

* RESTful API with `/api/v1` versioning
* User registration and login
* Password hashing with bcrypt
* JWT authentication for protected routes
* User-specific trip CRUD operations
* Role-based admin access
* SQLite database storage
* OpenWeatherMap weather integration
* Weather-based travel summary for saved trips
* Zod request validation
* Centralized error handling
* Security middleware using Helmet, CORS, and rate limiting
* Automated tests using Jest and Supertest
* Manual API testing using Postman

## Setup Instructions

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
OPENWEATHER_API_KEY=openweathermap_api_key
JWT_SECRET=long_random_jwt_secret
```

Run the development server:

```bash
npm run dev
```

Run automated tests:

```bash
npm test
```

## Health Check

```http
GET http://localhost:3000/health
```

Expected response:

```json
{
  "success": true,
  "status": "OK",
  "message": "Smart Travel Planner API is running"
}
```

## API Endpoints

### Authentication

| Method | Endpoint                | Description                | Protected |
| ------ | ----------------------- | -------------------------- | --------- |
| POST   | `/api/v1/auth/register` | Register a new user        | No        |
| POST   | `/api/v1/auth/login`    | Log in and receive a JWT   | No        |
| GET    | `/api/v1/auth/me`       | Get logged-in user profile | Yes       |

### Trips

| Method | Endpoint                    | Description                              | Protected |
| ------ | --------------------------- | ---------------------------------------- | --------- |
| POST   | `/api/v1/trips`             | Create a new trip                        | Yes       |
| GET    | `/api/v1/trips`             | Get all trips for the logged-in user     | Yes       |
| GET    | `/api/v1/trips/:id`         | Get one trip by ID                       | Yes       |
| PUT    | `/api/v1/trips/:id`         | Update one trip by ID                    | Yes       |
| DELETE | `/api/v1/trips/:id`         | Delete one trip by ID                    | Yes       |
| GET    | `/api/v1/trips/:id/weather` | Get trip with weather and travel summary | Yes       |

### Weather

| Method | Endpoint                      | Description                    | Protected |
| ------ | ----------------------------- | ------------------------------ | --------- |
| GET    | `/api/v1/weather?city=London` | Get current weather for a city | No        |

### Admin

| Method | Endpoint              | Description                  | Protected       |
| ------ | --------------------- | ---------------------------- | --------------- |
| GET    | `/api/v1/admin/trips` | Get all trips from all users | Yes, admin only |

## Authentication

Protected routes require a JWT token in the request header:

```http
Authorization: Bearer your_token_here
```

Example register request:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```

Example login request:

```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

## Example Trip Request

```json
{
  "destination": "Tokyo",
  "country": "Japan",
  "startDate": "2026-06-01",
  "endDate": "2026-06-07",
  "notes": "Visit temples and try local food",
  "preferences": "Food, culture, sightseeing"
}
```

## Example Success Response

```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "destination": "Tokyo",
    "country": "Japan",
    "startDate": "2026-06-01",
    "endDate": "2026-06-07",
    "notes": "Visit temples and try local food",
    "preferences": "Food, culture, sightseeing",
    "createdAt": "2026-06-08 10:00:00",
    "updatedAt": "2026-06-08 10:00:00"
  }
}
```

## Example Error Response

```json
{
  "success": false,
  "message": "Trip not found"
}
```

## Third-Party API Integration

This project integrates OpenWeatherMap to fetch real-time weather data.

The weather data is used in two ways:

1. Public weather search by city
2. Weather summary for a saved trip destination

The API handles common third-party API errors, including:

* Missing API key
* Invalid API key
* Invalid city name
* City not found
* Weather API rate limit
* Weather API timeout
* Network failure
* Unexpected weather response format

## API Documentation and Postman Testing

API documentation and Postman files are included in the `postman` folder.

```txt
postman/
  Smart Travel Planner API.postman_collection.json
  Smart Travel Planner Local.postman_environment.json
```

The Postman collection contains organised requests for authentication, trip management, weather, admin access, and error testing.

## Automated Testing

Automated tests are written using Jest and Supertest.

Run tests:

```bash
npm test
```

The automated tests cover:

* Health check
* User registration
* Duplicate email prevention
* User login
* Protected route authentication
* Trip CRUD operations
* Trip validation
* User ownership checks
* Weather endpoint with mocked weather data
* Trip weather summary
* Admin role access
* Clean error responses

## Security Features

* Passwords are hashed using bcrypt.
* JWT is used for protected routes.
* Users can only access their own trips.
* Admin-only routes use role-based access control.
* API keys and JWT secrets are stored in `.env`.
* `.env` is ignored by Git.
* Helmet is used for secure HTTP headers.
* CORS is configured.
* Rate limiting helps reduce repeated request abuse.
* Request body size is limited.
* Zod validates request input.
* Unexpected server errors return safe messages.

## Notes About Admin Testing

Normal registered users are created with the `user` role by default.

For testing the admin route, an admin user can be created by updating the user role in the SQLite database during testing or by using a prepared test setup.

## Limitations

* This is a backend-only project with no frontend interface.
* OpenWeatherMap data depends on external API availability.
* Admin account creation is handled manually for testing.
* SQLite is suitable for a small project but not ideal for high-traffic production systems.
* The weather summary is rule-based and does not have AI implementation.
