# 🌙 DreamWeaver Frontend 😴

![DreamWeaver Logo](./public/logo.png)

> *Mindful sleep, made digital.*

---

![Screenshot of DreamWeaver App](./public/screenshot.pn---
## 🏆 Development Methodology

Visual assets included in this project were generated using AI technology provided by ImagePrompt.org.

Favicons were produced by converting images with the assistance of RedKetchup's Favicon Generator.

**AI-Assisted Development**: This project demonstrates effective collaboration with AI tools for enhanced development efficiency. GitHub Copilot was leveraged for comprehensive code review, debugging assistance, documentation generation, and quality assurance. This approach showcases modern development practices where AI augments developer capabilities for improved code quality, faster problem resolution, and maintainable software architecture.

This project is a student portfolio piece intended for educational and demonstrative purposes.

--- ✨ About the Project

DreamWeaver is a mindfulness and self-accountability app that helps users improve their sleep through intentional bedtime rituals and reflective journaling. With just a single tap, users can log their journey to sleep, capture dreams or sleepy thoughts, and track patterns over time.

This is the **frontend** repository, built using **React**, **Vite**, and **Bootstrap**.

---

## 🚀 Features

- 🔐 **Authentication System** - JWT-based signup, login, and secure logout
- 📱 **Mobile-First Design** - Responsive Bootstrap UI that works on all devices
- 🌒 **Interactive Dashboard** featuring:
  - User profile summary with customizable preferences
  - Bedroom environment management and tracking
  - Recent sleep sessions and dream journal entries
  - Quick access to all major app functions
- 🌛 **Sleep Tracking** - One-click "Go To Bed" and "Wake Up" with session logging
- 📓 **Dream Journaling** - Capture thoughts, dreams, and reflections organized by sleep session
- 🛏️ **Smart Bedroom Management** - Track environmental factors (light, noise, temperature) across multiple sleeping spaces
- 📊 **Sleep Analytics** - View sleep history, patterns, and quality assessments over time
- ⚙️ **User Preferences** - Customizable settings for units (metric/imperial), time format (12/24 hour), and dark/light themes
- 🧭 **Intuitive Navigation** - Semantic routing with breadcrumbs, back navigation, and user-friendly URLs
- 🛡️ **Admin Controls** - Administrative dashboard for user management (admin users only)
- ♿ **Accessibility Features** - Screen reader support, ARIA labels, and keyboard navigation

---

## 🖼️ Screenshots

> Replace with your actual hosted image or drop a screenshot here.

---

## 🛠️ Tech Stack

- ⚛️ **React 18** with Vite for fast development and building
- 🎨 **Bootstrap 5** + Custom Sass for responsive styling
- 🧠 **React Context API** for state management (User, Dashboard, Theme contexts)
- 🔄 **Axios** for HTTP requests and API integration
- 🗺️ **React Router v6** for client-side routing and navigation
- 📅 **date-fns** for robust date formatting and manipulation
- 🎯 **Lucide React** for consistent iconography
- 🍞 **React Toastify** for user notifications
- 🌍 **Theme System** with user preference synchronization
- 🧪 **Modern Development Tools** - ESLint, Vite HMR, and modular architecture

---

## 📂 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── forms/           # Form components (Login, Signup, etc.)
│   ├── layout/          # Layout components (NavBar, Footer)
│   ├── admin/           # Admin-only components
│   └── shared/          # Shared utility components
├── contexts/            # React Context providers (User, Dashboard, Theme)
├── hooks/               # Custom React hooks
├── services/            # API service modules (auth, user, bedroom, sleep)
├── styles/              # Sass stylesheets and component-specific styles
├── assets/              # Static assets (images, logos, wireframes)
├── App.jsx              # Main application component with routing
└── main.jsx             # Application entry point
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

## 👩‍💻 Developer Notes

- **Authentication**: All protected routes require JWT token validation through the backend API
- **State Management**: User preferences (units, theme, time format) sync between frontend contexts and backend storage
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages throughout the application  
- **Accessibility**: Built with ARIA labels, screen reader support, and keyboard navigation standards
- **API Integration**: RESTful API communication with robust error handling and input validation
- **Code Quality**: Extensive JSDoc documentation, consistent code patterns, and comprehensive commenting
- **Security**: Input sanitization, token-based authentication, and role-based access controls
- **Performance**: Optimized builds, lazy loading, and efficient state management
- **Responsive Design**: Mobile-first approach with Bootstrap grid system and custom breakpoints

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