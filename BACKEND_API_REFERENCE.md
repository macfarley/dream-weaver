# 🌙 DreamWeaver Backend API Reference 😴

> *API endpoint reference for DreamWeaver frontend integration.*

This document serves as a bridge between the frontend and backend, documenting the API endpoints available for the DreamWeaver application.

---

## 🗄️ Backend Repository
- **Repository**: https://github.com/macfarley/dream-weaver-backend.git
- **Tech Stack**: Node.js, Express, MongoDB, JWT Authentication
- **Default Port**: 3000 (backend)

---

# DreamWeaver Backend-to-Frontend Bridge Reference
# Generated: 2025-06-21

This file documents the key API endpoints, authentication flows, and data contracts for integrating the DreamWeaver backend with the frontend. Use this as a reference for frontend development and API consumption.

---

## Authentication

- **POST /auth/sign-up**
  - Registers a new user. Returns `{ token, user }` on success.
- **POST /auth/sign-in** or **POST /auth/login**
  - Logs in a user. Returns `{ token, user }` on success.
- **JWT Token**
  - Must be sent as `Authorization: Bearer <token>` in all protected requests.
  - Token is refreshed and returned after PATCH `/users/profile`.

---

## User Profile

- **GET /users/profile**
  - Returns the authenticated user's full profile (all fields except password hash). Example response:

```json
{
  "_id": "6853277527f8af5c42c8b361",
  "username": "dreamadmin",
  "firstName": "Randy",
  "lastName": "Quaid",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "email": "rquaid@hollywood.com",
  "userPreferences": {
    "useMetric": false,
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "24-hour",
    "theme": "dark"
  },
  "role": "admin",
  "createdAt": "2025-06-18T20:54:13.600Z",
  "updatedAt": "2025-06-22T00:31:11.000Z"
}
```

- **PATCH /users/profile**
  - Partial update. Returns `{ data: user, token }` (new JWT reflects changes).
  - Username and role cannot be changed here.

> **Note:** These are the only two endpoints under `/users/`.

---

## User Object Fields (as returned by GET /admin/users/:id or /users/:id)
- `_id`: MongoDB ObjectId
- `username`: String
- `firstName`: String
- `lastName`: String
- `dateOfBirth`: ISO 8601 date string
- `email`: String
- `role`: String ("user" or "admin")
- `createdAt`: ISO 8601 date string (when the user joined)
- `updatedAt`: ISO 8601 date string (last profile update)
- `userPreferences`: Object (optional, not shown to admins by default)

---

## Sleep Data

- **GET /users/**
  - Returns all sleep data for the authenticated user.
- **GET /sleep-data**
  - Returns all sleep sessions for the user.
- **GET /sleep-data/:date**
  - Returns a specific sleep session by date (YYYYMMDD).
- **PUT /sleep-data/:id**
  - Updates a sleep session.
- **DELETE /sleep-data/:id**
  - Deletes a sleep session (requires password).

---

## Bedroom Management

- **GET /bedrooms**
  - List all bedrooms for the user.
- **POST /bedrooms/new**
  - Create a new bedroom.
- **GET /bedrooms/:id**
  - Get bedroom by ID.
- **PUT /bedrooms/:id**
  - Update bedroom.
- **DELETE /bedrooms/:id**
  - Delete bedroom.

---

## Sleep Session (Go To Bed)

- **POST /gotobed**
  - Start a new sleep session. Returns 409 with session info if already active.
- **GET /gotobed/active**
  - Check if a session is active.
- **POST /gotobed/wakeup**
  - Add wakeup data to the current session.

---

## Admin (for admin users only)

- **GET /admin/users**
  - List all users.
- **GET /admin/users/:id**
  - Get user details. Returns all user fields above (except password hash).
- **PATCH /users/:id**
  - Update user (except role/username). Admins cannot update other admins.
- **DELETE /admin/users/:id**
  - Delete user (requires admin password).

---

## How to Get Last Sleep Session for a User (Admin)

- **GET /sleep-data?userId=USERID**
  - (If supported for admins) Returns all sleep sessions for the specified user. Sort by `createdAt` descending to get the latest session.
  - If not supported, a new admin endpoint may be needed.

---

## Notes
- All dates are ISO 8601 strings unless otherwise noted.
- All endpoints return JSON.
- On profile update, always use the new JWT for subsequent requests.
- For error handling, check for `error` or `message` fields in responses.

---

## 🔧 Frontend Service Integration

### Current Frontend Services
- `authService.js` → `/auth/*` endpoints
- `userService.js` → `/users/*` endpoints  
- `bedroomService.js` → `/bedrooms/*` endpoints
- `sleepDataService.js` → `/sleep-data/*` endpoints
- `sleepSessionService.js` → `/gotobed/*` endpoints
- `adminService.js` → `/admin/*` endpoints

### Key Integration Notes
1. **Authentication**: All protected routes require JWT token in Authorization header
2. **Date Format**: Sleep data dates use YYYYMMDD format
3. **User Context**: User data is determined by JWT token (no user ID in URL)
4. **Error Handling**: Backend returns structured error messages
5. **CORS**: Backend is configured for cross-origin requests from frontend

---

## 🐞 Common Issues & Solutions

### Route Not Found (404)
- **Problem**: Frontend calling incorrect endpoint format
- **Solution**: Check this reference document for exact endpoint paths

### Authentication Failed (401)
- **Problem**: Missing or invalid JWT token
- **Solution**: Ensure user is logged in and token is included in requests

### Date Format Issues
- **Problem**: Backend expects YYYYMMDD, frontend sending different format
- **Solution**: Convert dates to YYYYMMDD before API calls

### User Data Access (403)
- **Problem**: User trying to access another user's data
- **Solution**: Backend enforces user ownership, no action needed

---

## 📊 Test Data (Development)

Backend provides seeded test data for development:

### Test User Credentials
```
Username: dreamtester1  | Password: password123
Username: dreamtester2  | Password: password123  
Username: sleepyuser    | Password: password123
```

### Seed Data Includes
- **Users**: Admin + 3 test users with realistic profiles
- **Bedrooms**: 3 different bedroom types per user (12 total)
- **Sleep Sessions**: 30 entries per user spanning last 30 days (120 total)
- **Wake Events**: 1-3 wake-ups per session with quality ratings

---

## 🔐 Security Notes

- **JWT Tokens**: Expire after 24 hours
- **Password Hashing**: Uses bcrypt with salt
- **Role Validation**: Admin routes protected by role check
- **Data Ownership**: Users can only access their own data
- **Admin Safeguards**: Admins cannot delete themselves

---

# End of Bridge File
