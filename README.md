# Smart Travel Planner API

Backend-only REST API for managing user trips and generating trip plans using saved trip data and real-time weather data from OpenWeatherMap.

## Tech Stack

Node.js v20.18.0, Express.js, SQLite, OpenWeatherMap API, JWT, bcrypt, crypto, dotenv, helmet, express-rate-limit, cors, morgan, zod, Jest, Supertest, Postman.

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
OPENWEATHER_API_KEY=openweathermap_api_key
JWT_SECRET=jwt_secret
ENCRYPTION_KEY=32_character_encryption_key
```

Run the server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

## Main Features

- User registration and login
- JWT authentication
- User-specific trip CRUD
- Admin route for viewing all trips
- OpenWeatherMap weather integration
- Trip Plan API with weather, advice, and packing checklist
- API key generation and hashing
- Encrypted trip notes and preferences
- Validation, rate limiting, Helmet, and centralized error handling
- Manual testing with Postman
- Automated testing with Jest and Supertest

## API Endpoints

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Check API status |

### Authentication

| Method | Endpoint | Protection |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | JWT required |

### Trips

| Method | Endpoint | Protection |
| --- | --- | --- |
| POST | `/api/v1/trips` | JWT required |
| GET | `/api/v1/trips` | JWT required |
| GET | `/api/v1/trips/:id` | JWT required |
| PUT | `/api/v1/trips/:id` | JWT required |
| DELETE | `/api/v1/trips/:id` | JWT required |
| GET | `/api/v1/trips/:id/weather` | JWT required |

### API Keys

| Method | Endpoint | Protection |
| --- | --- | --- |
| POST | `/api/v1/api-keys` | JWT required |
| GET | `/api/v1/api-keys` | JWT required |

### Trip Plan and Packing List

| Method | Endpoint | Protection |
| --- | --- | --- |
| GET | `/api/v1/trip-plan/:tripId` | API key required |
| GET | `/api/v1/packing-list/:tripId` | API key required |

### Weather

| Method | Endpoint | Protection |
| --- | --- | --- |
| GET | `/api/v1/weather?city=London` | Public |

### Admin

| Method | Endpoint | Protection |
| --- | --- | --- |
| GET | `/api/v1/admin/trips` | Admin only |

## Authentication Headers

JWT routes require:

```http
Authorization: Bearer user_token
```

API key routes require:

```http
x-api-key: api_key
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

## Testing

The project is tested manually using Postman and automatically using Jest/Supertest.

Tests cover authentication, trip CRUD, user ownership, weather integration, API keys, trip plan, packing list, admin access, and error handling.

## Security

Passwords are hashed with bcrypt. JWT protects user routes. API keys are generated with crypto, shown once, hashed before storage, and expire after 90 days. Sensitive trip notes and preferences are encrypted. Secrets are stored in `.env`, which is ignored by Git.

## Limitations

- Backend-only project with no frontend
- OpenWeatherMap depends on external API availability
- Admin role is prepared manually for testing
- SQLite is suitable for a small project, not high-traffic production
- Travel advice and packing checklist are rule-based, not AI
- Uses current weather data, not long-term forecasts

## OpenAPI Documentation

The OpenAPI documentation is available in:

`docs/openapi.yaml`

It describes the implemented API endpoints, request formats, authentication methods, and expected responses.