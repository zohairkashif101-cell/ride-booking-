# 🚗 Ride Booking Application

A full-stack Ride Booking web application featuring user authentication, ride management, payments, and ratings. Built with **Node.js, Express, MongoDB** for the backend and **React** for the frontend.

---

## ✨ Features

- **🔐 User & Auth Management:** JWT-based authentication (Register, Login, Middleware for protected routes).
- **🚖 Ride Controller & Routes:** Request, update, and manage ride bookings.
- **💳 Payment Integration:** Payment routes & controllers for handling transactions.
- **⭐ Ratings & Reviews:** Rate drivers and rides with feedback system.
- **🛡️ Error & Auth Middlewares:** Secure API routes and centralized error handling.

---

## 📁 Project Structure

```text
ride-booking/
├── .gitignore
├── README.md
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB Connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── paymentController.js
│   │   ├── ratingController.js
│   │   └── rideController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Payment.js
│   │   ├── Rating.js
│   │   ├── Ride.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── ratingRoutes.js
│   │   └── rideRoutes.js
│   ├── .env
│   ├── app.js
│   ├── package.json
│   └── server.js
└── frontend/                  # React Application
