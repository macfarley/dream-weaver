# 🌙 dreamWeaver

**dreamWeaver** is a minimalist sleep-tracking web app that helps users monitor their sleep quality, log pre- and post-sleep notes, and customize their sleep environments through configurable "bedrooms."

Users can access it via the web or save it to their mobile home screen like an app.

---

## 🚀 Features

- Start and stop sleep sessions with a simple "Go to Bed" / "Wake Up" workflow
- Create and manage multiple "bedrooms" to track sleeping conditions (temperature, noise, light, etc.)
- Record sleepy thoughts and morning reflections with each session
- Rate how well-rested you feel upon waking
- View sleep graphs and dream journal history in a user-friendly dashboard

---

## 🛠 Tech Stack

- **Frontend:** React (PWA-style for mobile install)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT-based session management

---

## 🌐 API Endpoints

### 🔐 Authentication
| Method | Endpoint       | Description           |
|--------|----------------|-----------------------|
| POST   | `/auth/signup` | Register a new user   |
| POST   | `/auth/login`  | Log in an existing user |
| GET    | `/auth/dashboard`     | Return current user info (dashboard) |
---

### 🛏️ Bedroom Management
| Method | Endpoint             | Description                         |
|--------|----------------------|-------------------------------------|
| GET    | `/bedrooms`          | Retrieve all bedrooms for user      |
| POST   | `/bedrooms`          | Create a new bedroom                |
| GET    | `/bedrooms/:id`      | View details of a single bedroom    |
| PUT    | `/bedrooms/:id`      | Update a bedroom                    |
| DELETE | `/bedrooms/:id`      | Delete a bedroom                    |

### 😴 Sleep Session Management
| Method | Endpoint             | Description                                 |
|--------|----------------------|---------------------------------------------|
| GET    | `/sleepdata`         | Retrieve all sleep sessions for user        |
| GET    | `/sleepdata/:date`   | Retrieve sleep session for a specific date  |
| PUT    | `/sleepdata/:date`   | Edit sleep session for a specific date      |
| DELETE | `/sleepdata/:date`   | Delete sleep session for a specific date    |
| POST   | `/gotobed`           | Start a new sleep session                   |
| PUT    | `/gotobed/wakeup`    | End the current sleep session (wake up)     |
**Bedroom Example Payload:**
```json
{
  "name": "Cool & Dark",
  "temperature": "68F",
  "lightLevel": "Dark",
  "noiseLevel": "Quiet",
  "notes": "Blackout curtains and white noise machine"
}
