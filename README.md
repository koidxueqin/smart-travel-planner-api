# Smart Travel Planner API

A backend-only REST API for a Smart Travel Planner assignment.  
The API allows users to manage travel records and will later combine saved trip data with real-time weather data from OpenWeatherMap.

## Project Type

Backend-only REST API tested using Postman.

## Technology Stack

- Node.js
- Express.js
- SQLite
- OpenWeatherMap API
- Postman
- dotenv
- helmet
- express-rate-limit
- cors
- morgan
- zod
- nodemon

## Features Completed

- Create travel records
- View all travel records
- View one travel record by ID
- Update travel records
- Delete travel records
- Store data in SQLite
- Validate request bodies using Zod
- Return JSON responses
- Centralized error handling
- Basic security middleware

## Setup Instructions

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
```

Run the development server:

```bash
npm run dev
```

Test the health route:

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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check if API is running |
| POST | `/api/v1/trips` | Create a new trip |
| GET | `/api/v1/trips` | Get all trips |
| GET | `/api/v1/trips/:id` | Get one trip by ID |
| PUT | `/api/v1/trips/:id` | Update one trip by ID |
| DELETE | `/api/v1/trips/:id` | Delete one trip by ID |

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
    "destination": "Tokyo",
    "country": "Japan",
    "startDate": "2026-06-01",
    "endDate": "2026-06-07",
    "notes": "Visit temples and try local food",
    "preferences": "Food, culture, sightseeing"
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

## Security

- API keys are stored in `.env`
- `.env` is ignored by Git
- API keys are not hard coded
- `helmet`, `cors`, and `express-rate-limit` are used
- Request validation is handled using Zod

