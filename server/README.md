# Nino Care Backend Server

Express.js backend server with MongoDB integration for the Nino Care application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `server` directory with the following:
```
MONGODB_URI=mongodb+srv://NINO:NiNo321@cluster0.wijuqkr.mongodb.net/nino-care
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

3. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)

### Health Logs
- `GET /api/health-logs` - Get all health logs (Protected)
- `POST /api/health-logs` - Create a health log (Protected)
- `PUT /api/health-logs/:id` - Update a health log (Protected)
- `DELETE /api/health-logs/:id` - Delete a health log (Protected)

### Vaccinations
- `GET /api/vaccinations` - Get all vaccinations (Protected)
- `POST /api/vaccinations` - Create a vaccination (Protected)
- `PUT /api/vaccinations/:id` - Update a vaccination (Protected)
- `DELETE /api/vaccinations/:id` - Delete a vaccination (Protected)

### Queries
- `GET /api/queries` - Get queries (Protected)
- `POST /api/queries` - Create a query (Parent only)
- `PUT /api/queries/:id/respond` - Respond to a query (Practitioner only)
- `PUT /api/queries/:id` - Update a query (Protected)
- `DELETE /api/queries/:id` - Delete a query (Protected)

## Authentication

Protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

The token is returned when registering or logging in.
