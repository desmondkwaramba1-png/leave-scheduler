# Team Leave Scheduler

A small internal HR tool for viewing team leave over the next 30 days, submitting leave requests, and approving or rejecting them, with a 30% team capacity rule and overlap protection.


## Video Walkthrough

https://www.loom.com/share/081a22f020714cc3b12a9df5e9128ed1

## Tech Stack

- Backend: Node.js, Express
- Database: SQLite (better-sqlite3)
- Frontend: React
- Testing: Jest

## Setup

### Backend

From the project root, copy the environment file first:

```bash
copy .env.example .env
```

Then install dependencies, seed the database, and start the server:

```bash
npm install
npm run seed
npm run dev
```

This installs dependencies, seeds the database with 3 teams and 15 employees, and starts the API server on `http://localhost:3001`.

### Frontend

In a separate terminal, from the project root:

```bash
cd client
npm install
npm start
```

This starts the React app on `http://localhost:3000`. The backend must already be running for the frontend to load data.

## Running Tests

From the project root:

```bash
npm test
```

This runs the automated test suite covering the 30% capacity rule and the overlap rule.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/leave-requests | Submit a new leave request |
| PATCH | /api/leave-requests/:id | Approve or reject a pending request |
| GET | /api/leave-requests | List leave requests for the next 30 days |

## Business Rule Decisions

See DECISIONS.md for the reasoning behind how the 30% capacity rule, weekend handling, public holidays, and overlapping requests are implemented.

## AI Usage

See AI_USAGE.md for details on how AI tools were used during development.