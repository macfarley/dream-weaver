# 🌙 DreamWeaver Backend 😴

![DreamWeaver Logo](./public/logo.png)

> *Sleep data storage and API for DreamWeaver frontend.*

---

![Screenshot of API in action](./public/screenshot.png)

---

## ✨ About the Project

This is the **backend** repository for DreamWeaver, providing a RESTful API built with **Node.js**, **Express**, and **MongoDB**. It handles user authentication, bedroom environment data, sleep session tracking, dream journaling, and administrative management.

---

## ✨ Features

- 🔐 **Secure Authentication**: JWT-based auth with role-based authorization (User/Admin)
- 🛏️ **Bedroom Management**: CRUD operations for bedroom environments linked to users
- 🌛 **Sleep Tracking**: Complete sleep session lifecycle with detailed data collection
- 👤 **User Profiles**: Profile management with preferences and personal information
- 🛠️ **Admin Dashboard**: Comprehensive admin tools for user and system management
- 📅 **Date/Time Handling**: Flexible date queries and timezone support
- 🔒 **Security Features**: Password hashing, ownership validation, and admin safeguards
- 🌙 **Dream Journaling**: Sleep thoughts and session notes with wake-up tracking

---

## 🛠️ Tech Stack

- 🟢 **Node.js** with Express.js framework
- 🍃 **MongoDB** with Mongoose ODM
- 🔐 **JWT** for secure authentication
- 🔑 **Bcrypt** for password hashing
- 🛡️ **Helmet** for security headers
- 🌐 **CORS** for cross-origin requests
- 📝 **Morgan** for request logging
- 🔧 **Dotenv** for environment variables

---

## 📂 Project Structure

```text
dream-weaver-backend/
├── controllers/           # API route handlers
│   ├── admin.js          # Admin user management
│   ├── auth.js           # Authentication (signup/signin)
│   ├── bedrooms.js       # Bedroom CRUD operations
│   ├── goToBed.js        # Sleep session management
│   ├── sleepData.js      # Sleep data tracking
│   └── users.js          # User profile management
├── middleware/           # Express middleware
│   ├── requireAdmin.js   # Admin role verification
│   └── verifyToken.js    # JWT token validation
├── models/              # MongoDB schemas
│   ├── Bedroom.js       # Bedroom environment model
│   ├── SleepData.js     # Sleep session model
│   └── User.js          # User account model
├── scripts/             # Utility scripts
│   └── seed.js          # Database seeding script
├── utils/                # Utility modules
│   └── jwt.js            # Centralized JWT creation/verification
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── README.md           # This file
└── server.js           # Main application entry point
```

---

## ✨ Features (continued)

- See full backend README for troubleshooting, installation, seeding, and API endpoint details.

---
