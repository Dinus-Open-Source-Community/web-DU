# Doscom Web Platform (Dinus Open Source Community)

A full-stack learning management system built with **Next.js + Go + PostgreSQL**. This platform enables course creation, enrollment management, and payment processing for online education.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Development](#development)
- [Deployment](#deployment)

---

## 🎯 Project Overview

Doscom Web is a comprehensive learning management system featuring:

- **User Management**: Registration, authentication (JWT + OAuth Google), user profiles & avatars
- **Course Management**: Create, manage, and organize courses with modules and lessons
- **Enrollment System**: Students can enroll in courses and track progress
- **Payment Integration**: Seamless payment processing via Tripay gateway
- **Course Reviews**: Students can review and rate courses
- **Responsive Design**: Modern UI with Tailwind CSS

---

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 15.5.6](https://nextjs.org/) with TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Runtime**: Node.js with hot reload support

### Backend

- **Language**: [Go 1.25.1](https://golang.org/)
- **Framework**: [Gin Web Framework](https://github.com/gin-gonic/gin)
- **Database**: PostgreSQL 15
- **ORM**: [GORM](https://gorm.io/)
- **Authentication**: JWT + Google OAuth
- **API Documentation**: Swagger/OpenAPI
- **Payment Gateway**: [Tripay API](https://tripay.co.id/)

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Database Admin**: Adminer (Web UI for PostgreSQL)

---

## 📁 Project Structure

```
web-DU/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── components/        # Reusable React components
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── backend/                     # Go backend application
│   ├── internal/
│   │   ├── database/          # PostgreSQL connection & migrations
│   │   ├── handler/           # HTTP request handlers & middleware
│   │   │   ├── middleware/    # JWT, CORS, auth middleware
│   │   │   └── routes/        # API route definitions
│   │   ├── model/             # Data models
│   │   │   ├── dto/           # Data Transfer Objects
│   │   │   └── entity/        # Database entities
│   │   ├── service/           # Business logic
│   │   └── utils/             # Helper functions (bcrypt, payments)
│   ├── public/
│   │   └── uploads/           # User uploads (avatars, course images)
│   ├── docs/                  # Swagger API documentation
│   ├── main.go
│   ├── go.mod
│   └── Dockerfile
│
├── docker-compose.yml         # Docker Compose configuration
└── README.md                  # This file
```

---

## 📦 Prerequisites

Ensure you have the following installed:

- **Docker** (v20+) & **Docker Compose** (v2+)
- **Git**
- _(Optional)_ **Go** (v1.25+) for local backend development
- _(Optional)_ **Node.js** (v18+) & **npm** for local frontend development

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Dinus-Open-Source-Community/web-DU.git
cd web-DU
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=doscom
DB_SSLMODE=disable
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=doscom

# Backend
BASE_URL=http://localhost:8080
JWT_SECRET_KEY=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Encryption
AES_KEY=your_aes_key_32_chars_long

# Tripay Payment Gateway
TRIPAY_API_KEY=your_tripay_api_key
TRIPAY_PRIVATE_KEY=your_tripay_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
HMAC_KEY=your_hmac_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

This will start all services:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger Documentation**: http://localhost:8080/swagger/index.html
- **Adminer (Database UI)**: http://localhost:8012

### 4. Stop the Project

```bash
docker-compose down
```

---

## 📚 API Documentation

The API documentation is available via Swagger/OpenAPI:

**URL**: [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)

### Main API Endpoints

#### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth callback
- `POST /api/auth/refresh` - Refresh JWT token

#### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/avatar` - Upload user avatar

#### Courses

- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course (instructor only)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (instructor only)
- `DELETE /api/courses/:id` - Delete course (instructor only)

#### Enrollments

- `POST /api/enrollments` - Enroll in a course
- `GET /api/enrollments` - List user enrollments
- `GET /api/enrollments/:id` - Get enrollment details

#### Payments

- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/callback` - Tripay webhook callback

#### Lessons & Modules

- `GET /api/modules/:id/lessons` - Get lessons in a module
- `POST /api/lessons/:id/complete` - Mark lesson as complete

---

## 🗄 Database

### PostgreSQL Setup

The PostgreSQL database is automatically initialized via Docker Compose. The database includes the following main tables:

- **users** - User accounts with roles (student/instructor)
- **courses** - Course information
- **enrollments** - Student course enrollments
- **modules** - Course modules
- **lessons** - Course lessons
- **payments** - Payment records
- **course_reviews** - Student course reviews
- **course_announcements** - Course announcements

### Access Database

**Adminer UI**: http://localhost:8012

- Server: `db`
- User: `postgres`
- Password: (from `.env` `POSTGRES_PASSWORD`)
- Database: (from `.env` `POSTGRES_DB`)

---

## 💻 Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Access at http://localhost:3000

### Backend Development

```bash
cd backend
go mod download
go run main.go
```

Backend runs on http://localhost:8080

---

## 🔐 Authentication

### JWT Token

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Google OAuth

Sign in with Google account for seamless authentication. Requires valid `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## 💳 Payment Integration

This project integrates with **Tripay** payment gateway for course payments. Features include:

- Multiple payment methods support
- Real-time payment status updates
- Webhook callback handling
- HMAC signature verification for security

Refer to [Tripay Documentation](https://docs.tripay.co.id/) for more details.
