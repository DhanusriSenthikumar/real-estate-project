# Riviera Realty

A full-stack real-estate marketplace built with Next.js on the frontend and Express.js on the backend. The application allows users to browse properties, search listings by location and type, view detailed property information, create accounts, sign in, and manage their own property listings from a dashboard.

## Project Overview

Riviera Realty is designed to provide a smooth real-estate browsing and listing experience with a modern UI, reusable components, and a clean user flow from home page to property details to user dashboard.

Users can:

- browse featured listings on the home page
- search properties by buy/rent, location, and property type
- view complete property details
- register and sign in securely
- manage their profile from the dashboard
- publish, edit, and remove their own listings

## Features

- Home page real-estate landing screen with strong search experience
- Buy/Rent toggle, location search, and property type filters
- Public property listing page with filtering, sorting, and pagination
- Individual property details page
- User registration and login flow with JWT-based authentication
- Protected dashboard routes for authenticated users
- Profile view and update functionality
- Property creation with title, location, price, property type, listing type, bedrooms, area, description, and image upload
- Ownership-based edit and delete controls
- Loading, empty, and error states for a better UX
- Responsive modern UI built with reusable components

## Tech Stack

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend:

- Express.js
- TypeScript
- JWT Authentication
- Zod validation
- bcryptjs for password hashing

Database:

- PostgreSQL

Media Storage:

- Cloudinary

## Project Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    prisma/
    routes/
    schemas/
    services/
    validators/

frontend/
  src/
    app/
    components/
    lib/
    types/
```

## Requirements

Before running the project, make sure you have:

- Node.js 20+
- PostgreSQL 15+
- A Cloudinary account for image uploads

## Environment Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder and add the required values:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/real_estate_db"
JWT_SECRET="your_super_secure_jwt_secret_at_least_32_chars"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
FRONTEND_URL="http://localhost:3000"
```

Then start the backend:

```bash
npm run dev
```

The backend runs at:

- `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the frontend folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then start the frontend:

```bash
npm run dev
```

The frontend runs at:

- `http://localhost:3000`

## Useful Commands

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

## API Overview

### Authentication

- `POST /auth/users` - register a new user
- `POST /auth/login` - login and receive JWT token
- `GET /auth/me` - get authenticated user profile
- `PATCH /auth/me` - update authenticated user profile

### Properties

- `GET /properties` - fetch public properties with filters and sorting
- `GET /properties/:id` - fetch one property by id
- `GET /properties/my` - fetch authenticated user listings
- `POST /properties` - create a property listing
- `PUT /properties/:id` - update a property owned by the user
- `DELETE /properties/:id` - delete a property owned by the user

Protected routes require:

```http
Authorization: Bearer <token>
```

## Demo Flow

1. Start PostgreSQL.
2. Start the backend and frontend.
3. Register a new user from the register page.
4. Sign in from the login page.
5. Go to the dashboard and create a property listing.
6. Verify the listing appears on the public home/property listing page.
7. Edit or delete the listing from the dashboard.
8. Sign out and verify protected routes redirect to login.

## Notes

This project focuses on the core real-estate workflow:

- search/list properties
- view property details
- authenticate users
- manage listings from dashboard
