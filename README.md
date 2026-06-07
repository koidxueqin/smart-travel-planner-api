# Smart Travel Planner API

A backend-only REST API for a Smart Travel Planner project.

The system allows users to register, log in, manage their own travel records, and combine saved trip data with real-time weather data from OpenWeatherMap.

## Project Type

Backend-only REST API tested using Postman and automated tests.

## Assignment Goal

This project demonstrates a Smart Travel Planner system that combines:

1. A self-developed API for managing user-specific travel records
2. A third-party API that provides real-time external weather data

The system stores user trips in SQLite and uses OpenWeatherMap to provide current weather information and travel advice for saved destinations.

## Technology Stack

- Node.js
- Express.js
- SQLite
- sqlite
- sqlite3
- OpenWeatherMap API
- Postman
- dotenv
- helmet
- express-rate-limit
- cors
- morgan
- zod
- bcrypt
- jsonwebtoken
- Jest
- Supertest
- cross-env
- nodemon

## Main Features

- RESTful API with `/api/v1` versioning
- User registration and login
- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- User-specific trip records
- Admin route for viewing all trips
- Create, read, update, and delete trips
- SQLite database storage
- Users-to-trips database relationship
- OpenWeatherMap third-party API integration
- Public weather endpoint
- Trip weather endpoint that combines saved trip data with real-time weather
- Weather-based travel summary
- Zod request validation
- Centralized error handling
- Secure `.env` usage
- Helmet security headers
- CORS support
- Express rate limiting
- Automated testing with Jest and Supertest

## Setup Instructions

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
OPENWEATHER_API_KEY=example_openweathermap_apikey
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

## Authentication Endpoints

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user | No |
| POST | `/api/v1/auth/login` | Log in and receive a JWT | No |
| GET | `/api/v1/auth/me` | Get logged-in user profile | Yes |

## Trip Endpoints

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/api/v1/trips` | Create a new trip | Yes |
| GET | `/api/v1/trips` | Get all trips for the logged-in user | Yes |
| GET | `/api/v1/trips/:id` | Get one trip by ID | Yes |
| PUT | `/api/v1/trips/:id` | Update one trip by ID | Yes |
| DELETE | `/api/v1/trips/:id` | Delete one trip by ID | Yes |
| GET | `/api/v1/trips/:id/weather` | Get trip with weather and travel summary | Yes |

## Weather Endpoint

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET | `/api/v1/weather?city=London` | Get current weather for a city | No |

## Admin Endpoint

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| GET | `/api/v1/admin/trips` | Get all trips from all users | Yes, admin only |

## Example Register Request

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```

## Example Login Request

```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

The login response returns a JWT token. Protected routes must include the token in the Authorization header:

```http
Authorization: Bearer your_token_here
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

## Example Trip Response

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

## Example Weather Response

```json
{
  "success": true,
  "message": "Weather fetched successfully",
  "data": {
    "city": "London",
    "country": "GB",
    "temperature": 18,
    "feelsLike": 17,
    "description": "clear sky",
    "humidity": 60,
    "windSpeed": 4
  }
}
```

## Example Trip With Weather Response

```json
{
  "success": true,
  "message": "Trip with weather fetched successfully",
  "data": {
    "trip": {
      "id": 1,
      "userId": 1,
      "destination": "London",
      "country": "United Kingdom",
      "startDate": "2026-07-10",
      "endDate": "2026-07-15",
      "notes": "Museum visit",
      "preferences": "Walking and sightseeing"
    },
    "weather": {
      "city": "London",
      "country": "GB",
      "temperature": 18,
      "feelsLike": 17,
      "description": "clear sky",
      "humidity": 60,
      "windSpeed": 4
    },
    "travelSummary": {
      "temperatureCategory": "Cool",
      "weatherCondition": "Clear",
      "suggestion": "Clear weather is suitable for outdoor sightseeing. Check local conditions before departure."
    }
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

## Security Features

- Passwords are hashed using bcrypt.
- JWT is used for protected routes.
- Users can only access their own trips.
- Admin-only routes use role-based access control.
- API keys and JWT secrets are stored in `.env`.
- `.env` is ignored by Git.
- Helmet is used for secure HTTP headers.
- Rate limiting helps reduce repeated request abuse.
- Request body size is limited.
- Zod validates user input.
- Unexpected server errors return safe messages.

## Testing

Automated tests are written using Jest and Supertest.

Run tests:

```bash
npm test
```

Current test coverage includes:

- Health check
- User registration
- Duplicate email prevention
- User login
- Protected route authentication
- Trip CRUD
- Trip validation
- User ownership checks
- Weather endpoint testing with mocked weather data
- Trip weather summary testing
- Admin role access testing
- Clean error responses

Manual testing is also performed using Postman.

## Notes About Admin Testing

Normal registered users are created with the `user` role by default.

For testing the admin route, an admin user can be created by updating the user role in the SQLite database during testing or by using a prepared test setup.

## Third-Party API Integration

The project integrates OpenWeatherMap to fetch real-time weather data.

The API handles common third-party API errors, including:

- Missing API key
- Invalid API key
- Invalid city name
- City not found
- Weather API rate limit
- Weather API timeout
- Network failure
- Unexpected weather response format

## Limitations

- This is a backend-only project with no frontend interface.
- OpenWeatherMap data depends on external API availability.
- Admin account creation is handled manually for testing.
- The project uses SQLite, which is suitable for small applications but not ideal for high-traffic production systems.
- The weather summary is rule-based and not AI
