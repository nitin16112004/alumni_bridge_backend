# Alumni Bridge Backend

A scalable Node.js + Express backend for the Alumni Bridge platform that enables mentorship, real-time communication, discussions, jobs, events, notifications, and role-based access for students, alumni, and colleges.

---

# Features

- JWT Authentication
- Role-Based Authorization
- OTP Verification System
- Mentor Management
- Mentorship Requests
- Real-Time Chat with Socket.IO
- Discussion Forum APIs
- Job Management APIs
- Event Management APIs
- Notification System
- College Approval System
- Protected Routes
- MongoDB Database Integration
- REST API Architecture

---

# Tech Stack

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO
- Nodemailer
- bcryptjs
- dotenv
- CORS

---

# Project Structure

```bash
backend/
│
├── src/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── otpController.js
│   │   ├── mentorController.js
│   │   ├── mentorshipController.js
│   │   ├── chatController.js
│   │   ├── aiController.js
│   │   ├── discussionController.js
│   │   ├── jobController.js
│   │   ├── eventController.js
│   │   ├── notificationController.js
│   │   ├── collegeController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── authorize.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── College.js
│   │   ├── Mentor.js
│   │   ├── MentorshipRequest.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Otp.js
│   │   ├── Discussion.js
│   │   ├── Job.js
│   │   └── Event.js
│   │
│   ├── routes/
│   │
│   ├── socket/
│   │   └── index.js
│   │
│   └── utils/
│       └── email.js
│
├── server.js
├── .env
├── package.json
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/alumni-bridge-backend.git
```

## Navigate To Project

```bash
cd alumni-bridge-backend
```

## Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

CLIENT_URL=http://localhost:5173
```

---

# Run Development Server

```bash
npm run dev
```

Server runs on:

```bash
http://localhost:5000
```

---

# Start Production Server

```bash
npm start
```

---

# API Base URL

```bash
http://localhost:5000/api
```

---

# Authentication Features

- User Registration
- User Login
- JWT Token Generation
- Protected Routes
- Role-Based Authorization
- OTP Verification
- Password Reset

---

# Available Modules

## Authentication

- Login
- Register
- Forgot Password
- OTP Verification

## Student Features

- Browse Mentors
- Send Mentorship Requests
- AI Assistant Access

## Alumni Features

- Manage Mentor Profile
- Handle Incoming Requests

## College Features

- Approval Queue
- College Dashboard

## Shared Features

- Chat System
- Discussions
- Jobs
- Events
- Notifications
- User Profiles

---

# Real-Time Features

Socket.IO is used for:

- Live Messaging
- Real-Time Notifications
- Instant Updates

Socket handlers located in:

```bash
src/socket/index.js
```

---

# Middleware

## Authentication Middleware

```bash
src/middleware/auth.js
```

Used for JWT verification.

## Authorization Middleware

```bash
src/middleware/authorize.js
```

Used for role-based access control.

---

# Database

MongoDB is used as the primary database.

Database connection file:

```bash
src/config/db.js
```

---

# Email Service

Nodemailer is used for:

- OTP Emails
- Authentication Emails
- Notifications

Utility file:

```bash
src/utils/email.js
```

---

# CORS Configuration

Example:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://alumni-bridge-frontend.vercel.app/"
    ],
    credentials: true,
  })
);
```

---

# Deployment

Backend deployed using Render.

---

# Render Deployment Settings

| Setting | Value |
|---|---|
| Build Command | npm install |
| Start Command | npm start |

---

# Backend Deployment URL

```bash
https://alumni-bridge-backend.onrender.com
```

---

# Author

Nitin Kumar

---

# License

This project is developed for educational and project purposes.
