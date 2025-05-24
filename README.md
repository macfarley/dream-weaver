# 🌙 dreamWeaver

**dreamWeaver** is a mindful, minimalist sleep-tracking app designed to help users better understand their rest patterns and sleep environments. With features for bedtime notes, morning reflection, and customizable sleep settings, it focuses on intention—not just data.

---

## 🛠️ Tech Stack

- **Frontend**: React (Progressive Web App — installable on mobile & desktop)
- **Backend**: Node.js with Express routing
- **Database**: MongoDB (via Mongoose ODM)

---

## ✨ Key Features

- ⏰ **Sleep Timer** — tap *Go to Bed* and *Wake Up* to track your rest
- 🛏️ **Multiple Bedrooms** — create custom settings like lighting, sound, and location
- 📝 **Night Notes** — journal sleepy thoughts or dream intentions
- ☀️ **Morning Reflection** — rate how well-rested you feel
- 📱 **Installable Web App** — works offline when bookmarked or added to home screen

---

## 🧬 Data Model (ERD)

![dreamWeaver ERD](./dreamWeaver-ERD.jpg)

### 🔑 Entity Overview

#### `User`
- Auth via username & password
- References to their `bedRoom` setups and `nightCap` sessions

#### `bedRoom`
- `_id`: Mongo-generated  
- `name`: e.g. “My Room”, “Tent”, “Hotel”  
- `lighting`: brightness level  
- `audio`: ambient sounds like music, TV, white noise

#### `nightCap`
- Timestamped start to each sleep session  
- Linked to a `bedRoom`  
- Contains user notes  
- Ends with a linked `wakeUp` object

#### `wakeUp`
- Time a user wakes up  
- Used to calculate session duration  
- Optionally includes a restfulness score (planned feature)

---

## 🧪 Sample API Endpoints

| Method | Endpoint         | Description                     |
|--------|------------------|---------------------------------|
| POST   | `/sleep/start`   | Begin a new sleep session       |
| POST   | `/sleep/end`     | End the session, store duration |
| GET    | `/bedrooms`      | List saved bedroom profiles     |
| POST   | `/bedrooms`      | Add a new bedroom               |
| POST   | `/notes`         | Save a bedtime note             |
| POST   | `/rating`        | Save morning restfulness score  |

---

## 👤 Creator

**Macfarley**  
Founder of [Extra G Data Solutions](https://www.linkedin.com/in/travis-mccoy-630775b9/)

---

## 🚧 Coming Soon

- 🧭 Timeline view of sleep history  
- 📈 Insights on conditions vs. restfulness  
- 💤 Dream journal export  
- 🔔 Optional bedtime reminders

---

## 📄 License

MIT License — fork it, build it, and drift into better sleep.

---

