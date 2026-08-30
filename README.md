# Riviera Realty

Riviera Realty is a full-stack real-estate marketplace. Visitors can search and browse public property listings, open property details, register and sign in, while authenticated users can manage their profile and publish, edit, or remove their own listings.

## Features

- Homepage search with Buy/Rent, location, and property-type filters
- Public property listing with search, filters, sorting, loading, empty, and error states
- Individual property detail pages
- User registration and JWT login
- Protected dashboard and property-management routes
- Profile viewing and editing
- Property creation with title, location, price, type, listing mode, BHK, area, description, and image upload
- Ownership checks for updating and deleting listings
- PostgreSQL persistence through the Prisma ORM contract
- Cloudinary image storage

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Express.js, TypeScript, Zod, JWT, bcryptjs
- Database: PostgreSQL
- Images: Cloudinary

## Requirements

- Node.js 20 or newer
- PostgreSQL 15 or newer
- Cloudinary account for property image uploads

## Setup

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Update `backend/.env` with your PostgreSQL and Cloudinary credentials. `JWT_SECRET` must be at least 32 characters long.

Start the API:

```powershell
npm run dev
```

The API runs at `http://localhost:5000` by default.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

The frontend runs at `http://localhost:3000` by default. Set `NEXT_PUBLIC_API_URL` in `.env.local` when the backend is hosted at another URL.

## Useful commands

Backend:

```powershell
npx tsc --noEmit
npm run dev
```

Frontend:

```powershell
npx tsc --noEmit
npm run lint
npm run build
npm run dev
```

## API overview

- `POST /auth/users` - register a user
- `POST /auth/login` - sign in and receive a JWT
- `GET /auth/me` - get the authenticated user's profile
- `PATCH /auth/me` - update the authenticated user's profile
- `GET /properties` - list and filter public properties
- `GET /properties/:id` - get one public property
- `GET /properties/my` - get the authenticated user's properties
- `POST /properties` - create a property with an optional image
- `PUT /properties/:id` - update an owned property
- `DELETE /properties/:id` - delete an owned property

Protected endpoints require:

```text
Authorization: Bearer <jwt>
```

## Demo flow

1. Start PostgreSQL, the backend, and the frontend.
2. Register a new account at `/register`.
3. Sign in at `/login`.
4. Open the dashboard and publish a property.
5. Confirm the listing appears on the homepage and `/properties`.
6. Edit or delete the listing from the dashboard.
7. Sign out and verify protected routes redirect to `/login`.

## Project structure

```text
backend/   Express REST API, authentication, database access, uploads
frontend/  Next.js application, pages, reusable UI, API client
```
