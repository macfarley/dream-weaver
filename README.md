# 🌙 DreamWeaver Frontend 😴

![DreamWeaver Logo](./public/logo.png)

> *Mindful sleep, made digital.*

---

![Screenshot of DreamWeaver App](./public/screenshot.png)

---

## ✨ About the Project

DreamWeaver is a mindfulness and self-accountability app that helps users improve their sleep through intentional bedtime rituals and reflective journaling. With just a single tap, users can log their journey to sleep, capture dreams or sleepy thoughts, and track patterns over time.

This is the **frontend** repository, built using **React**, **Vite**, and **Bootstrap**.

---

## 🚀 Features

- 🔐 Authentication with JWT (Sign Up, Login, Logout)
- 📱 Mobile-first responsive design
- 🌒 Dashboard with:
  - Profile summary and preferences
  - Bedroom environment overview
  - Recent sleep session and dream entries
- 🌛 One-click **Go To Bed** and **Wake Up**
- 📓 Dream and thought journals grouped by session
- 🛏️ Bedroom setup with light/noise/temperature tracking
- 📊 Sleep quality and self-assessment logs
- ⚙️ User preferences: metric/imperial, 12/24 hour time, theme
- 🧭 Semantic routing with breadcrumb and back-navigation
- 🛡️ Admin dashboard (view/edit users)

---

## 🖼️ Screenshots

> Replace with your actual hosted image or drop a screenshot here.

---

## 🛠️ Tech Stack

- ⚛️ React (with Vite)
- 🎨 Bootstrap 5 + Sass
- 🧠 React Context API
- 🔄 Axios for API calls
- 🗺️ React Router v6
- 🌍 Internationalization & Preferences
- 🧪 Toasts, Modals, and Mobile Navigation

---

## 📂 Project Structure

```
src/
├── components/    # Reusable UI components
├── contexts/      # UserContext and DashboardContext
├── pages/         # Main views (Dashboard, Profile, SleepSession, etc.)
├── services/      # API services (authService, userService, etc.)
├── styles/        # Sass/CSS custom styling
└── App.jsx        # Main routing logic
```

---

## 🚀 Getting Started

1. **Clone the frontend repo:**

   ```bash
   git clone https://github.com/macfarley/dream-weaver-frontend.git
   cd dream-weaver-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Add your `.env` file:**

   ```
   VITE_BACK_END_SERVER_URL=http://localhost:3000
   ```

4. **Run the app locally:**

   ```bash
   npm run dev
   ```

---

## 👩‍💻 Developer Instructions

- All authenticated views require a JWT token from the backend.
- User preferences (unit format, theme, etc.) are synced with the backend and applied globally via UserContext.
- On logout, context is cleared and user is returned to the landing page.
- The app supports conditional routing and updates based on DashboardContext.
- Semantic URLs (like `/bedrooms/:bedroomName`) avoid exposing database IDs to the user.

---

## 🌐 Deployment Notes

To deploy the frontend (e.g., Netlify, Vercel):

- Update `VITE_BACK_END_SERVER_URL` to match your production API endpoint.
- Ensure HTTPS and CORS headers are handled on the backend.
- Optionally build using:

  ```bash
  npm run build
  ```

---

## 🔗 Links

- 🧠 [Backend GitHub Repository](#)
- 💻 [Frontend GitHub Repository](#)
- 📖 [Live Site – Coming Soon](#)

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🤝 Acknowledgments

Created as a final project for the General Assembly Software Engineering Bootcamp. Thanks to our instructors, peers, and the open-source community for inspiration and guidance.

---

## 🧙‍♂️ Author

Built by Macfarley (Mac McCoy)  
[LinkedIn](https://www.linkedin.com/in/travis-mccoy-630775b9/)

---
Acknowledgments
Visual assets included in this project were generated using AI technology provided by ImagePrompt.org.

Favicons were produced by converting images with the assistance of RedKetchup's Favicon Generator.

I would like to express my appreciation to OpenAI’s ChatGPT for serving as an invaluable resource for problem-solving, debugging, and providing guidance throughout the development process.

This project is a student portfolio piece intended for educational and demonstrative purposes.

---

## ❓ Support

 Run into issues? Head to [GitHub repo](https://github.com/macfarley/dream-weaver) and open an issue.
For feature requests, please create a new issue and label it as a feature request.
For bugs, please create a new issue and label it as a bug.
For general inquiries, please reach out via [LinkedIn](https://www.linkedin.com/in/travis-mccoy-630775b9/).