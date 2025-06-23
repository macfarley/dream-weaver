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
# Generated: 2025-06-22

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
  - Returns the authenticated user's full profile (all fields except password hash). This endpoint is never cached and always returns a fresh user object (cache-control headers are set by the backend).
  - Example response:

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
  "joinedAt": "2025-06-18T20:54:13.600Z",
  "updatedAt": "2025-06-22T00:31:11.000Z"
}
```

> **Note:** This endpoint sets `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate` and related headers. Browsers and proxies will never return a 304 or cached response. Always expect a fresh user object in the response body.

- **PATCH /users/profile**
  - Partial update. Returns `{ user, token }` (new JWT reflects changes).
  - Username and role cannot be changed here.

> **Note:** These are the only two endpoints under `/users/`.

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
  - List all users (admin only).
- **GET /admin/users/:id**
  - Get user details (admin or self-access only).
- **PATCH /admin/users/:id**
  - Partially update user (admin can update users, but cannot update other admins; admins can only self-update if target is admin). Username and role cannot be changed. Email must be unique. See security notes below.
- **DELETE /admin/users/:id**
  - Delete user (admin only; requires admin password confirmation in `x-admin-password` header or body). Cannot delete other admins or self. Cascade deletes all user data (bedrooms, sleep data, etc). See security notes below.

> **Security Notes:**
> - All admin endpoints require valid JWT and admin role.
> - Admins cannot update or delete other admins (only self-update/delete allowed for admins).
> - Deletion requires admin password confirmation and performs full cascade deletion of user data.
> - All sensitive fields (password, role, username) are protected from unauthorized changes.
> - All actions are logged for audit purposes.

---

## Notes
- All dates are ISO 8601 strings unless otherwise noted.
- All endpoints return JSON.
- On profile update, always use the new JWT for subsequent requests.
- For error handling, check for `error` or `message` fields in responses.

---

# End of Bridge File
