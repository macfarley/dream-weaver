# 🌙 DreamWeaver Backend API Reference 😴

> *API endpoint reference for DreamWeaver frontend integration.*

This document serves as a bridge between the frontend and backend, documenting the API endpoints available for the DreamWeaver application.

---

## 🗄️ Backend Repository
- **Repository**: https://github.com/macfarley/dream-weaver-backend.git
- **Tech Stack**: Node.js, Express, MongoDB, JWT Authentication
- **Default Port**: 3000 (backend)

---

## 🧑‍💻 API Endpoints Overview

### 🔓 **Authentication Routes**
| Route | Method | Description | Auth Required |
|-------|---------|-------------|---------------|
| `/auth/sign-up` | POST | Create new user account | No |
| `/auth/sign-in` | POST | Login user and get JWT token | No |

### 👤 **User Routes**
| Route | Method | Description | Auth Required |
|-------|---------|-------------|---------------|
| `/users/` | GET | Get user's sleep data (alternative endpoint) | Yes |
| `/users/profile` | PATCH | Update current user profile (partial) | Yes |

### 🛏️ **Bedroom Routes**
| Route | Method | Description | Auth Required |
|-------|---------|-------------|---------------|
| `/bedrooms` | GET | List user bedrooms | Yes |
| `/bedrooms/new` | POST | Create new bedroom | Yes |
| `/bedrooms/by-name/:bedroomName` | GET | Get bedroom by name | Yes |
| `/bedrooms/:id` | GET | Get bedroom by ID | Yes |
| `/bedrooms/:id` | PUT | Update bedroom | Yes |
| `/bedrooms/:id` | DELETE | Delete bedroom | Yes |

### 🌙 **Sleep Data Routes** ⚠️ **IMPORTANT FOR FRONTEND**
| Route | Method | Description | Auth Required |
|-------|---------|-------------|---------------|
| `/sleep-data` | GET | Get all sleep sessions for user | Yes |
| `/sleep-data/:date` | GET | Get sleep session by date (YYYYMMDD) | Yes |
| `/sleep-data/:id` | PUT | Update sleep session | Yes |
| `/sleep-data/:id` | DELETE | Delete sleep session (requires password) | Yes |

**⚠️ Date Format**: The `:date` parameter expects YYYYMMDD format (e.g., `20250621` for June 21, 2025)

### 🛌 **Go To Bed Routes**
| Route | Method | Description | Auth Required |
|-------|---------|-------------|---------------|
| `/gotobed` | POST | Start new sleep session | Yes |
| `/gotobed/active` | GET | Check for active session | Yes |
| `/gotobed/wakeup` | POST | Add wakeup data to session | Yes |

### 🛠️ **Admin Routes**
| Route | Method | Description | Auth Required |
|-------|---------|-------------|---------------|
| `/admin/users` | GET | List all users | Admin only |
| `/admin/users/:id` | GET | Get specific user details | Admin only |
| `/admin/users/:id` | PUT | Update user (except role/username) | Admin only |
| `/admin/users/:id` | DELETE | Delete user (requires admin password) | Admin only |

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

*This reference document should be updated when backend API changes.*
