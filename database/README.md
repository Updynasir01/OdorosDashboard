# Database

This project uses **MongoDB** (NoSQL database) instead of PostgreSQL.

## Why MongoDB?

- **Flexible Schema**: Easy to add new fields without migrations
- **JavaScript/TypeScript Native**: Works seamlessly with Node.js
- **JSON-like Documents**: Matches our data structure perfectly
- **Easy to Scale**: MongoDB Atlas offers free cloud hosting

## Models

All database models are defined in `backend/src/models/`:

- **Region.ts** - Somalia regions with drought data
- **Alert.ts** - Early warning alerts
- **TimeSeries.ts** - Historical time series data
- **Impact.ts** - Impact and vulnerability data
- **Prediction.ts** - AI predictions

## Setup

1. Install MongoDB locally OR use MongoDB Atlas (free cloud option)
2. Update `MONGODB_URI` in `backend/.env`
3. Run `npm run seed` to populate with initial data

## Connection

The database connection is handled in `backend/src/db/connection.ts` using Mongoose.

No SQL migrations needed! MongoDB is schema-less, but we define schemas in our Mongoose models for validation.

