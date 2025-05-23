# BadmintonHub - Court Booking Platform

## Overview

BadmintonHub is a full-stack web application designed to connect badminton players with court owners, allowing users to search, book, and manage badminton courts. The platform includes features for user registration/authentication, court searching, booking management, player matching, and court owner operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

BadmintonHub follows a modern full-stack architecture:

- **Frontend**: React with TypeScript, deployed as a static bundle
- **Backend**: Express.js API server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with session support
- **Styling**: Tailwind CSS with shadcn/ui components

The application is organized into three main directories:
- `client/`: React frontend application
- `server/`: Express.js backend API
- `shared/`: Shared TypeScript types and database schema

This architecture allows for type-safe data sharing between frontend and backend, while maintaining a clear separation of concerns.

## Key Components

### Frontend

1. **Pages**: The application includes several key pages:
   - Home page with featured courts and CTA sections
   - Court search and browsing
   - Court details and booking
   - User authentication (login/register)
   - Player matching
   - User profile and bookings management
   - Court owner dashboard

2. **UI Components**: Using shadcn/ui component library with Radix UI primitives for accessible, customizable components. The UI follows a consistent design language with:
   - Light/dark mode support
   - Responsive design for mobile and desktop
   - Reusable UI components

3. **State Management**:
   - React Query for server state management and data fetching
   - React context for global application state (auth, theme)
   - Local component state for UI interactions

### Backend

1. **API Routes**: Express.js routes for:
   - User authentication and management
   - Court management and search
   - Booking creation and management
   - Player requests and matching
   - Reviews and ratings

2. **Authentication**: JWT-based authentication system with:
   - Session management
   - Role-based access control (regular users vs. court owners)

3. **Storage Layer**: Abstraction over database operations with:
   - User operations
   - Court operations
   - Booking operations
   - Time slot management
   - Player request handling

### Database Schema

The application uses Drizzle ORM with a PostgreSQL schema that includes:

1. **Users**: Stores user accounts with roles (regular player or court owner)
2. **Courts**: Stores court information, location, pricing, and owner details
3. **Bookings**: Handles court reservations with dates, times, and status
4. **TimeSlots**: Manages available court times
5. **PlayerRequests**: Facilitates player matching for games
6. **Chats**: Supports communication between users
7. **Reviews**: Stores court ratings and reviews

## Data Flow

1. **Authentication Flow**:
   - User registers or logs in
   - Server validates credentials and issues JWT token
   - Token is stored in localStorage and included in API requests
   - Protected routes check token validity

2. **Court Booking Flow**:
   - User searches for courts by location/date/time
   - User selects a court and views available time slots
   - User books a slot, creating a booking record
   - Court owner approves or rejects the booking
   - User receives confirmation

3. **Player Matching Flow**:
   - User creates a player request with location/time/skill level
   - Other users can view and respond to requests
   - Users connect and arrange games through in-app chat

4. **Court Management Flow** (for court owners):
   - Court owner creates/edits court listings
   - Owner manages bookings and availability
   - Owner responds to reviews and ratings

## External Dependencies

### Frontend Libraries
- React and React DOM for UI rendering
- wouter for routing (lightweight alternative to React Router)
- @tanstack/react-query for data fetching and cache management
- Tailwind CSS for styling
- shadcn/ui + Radix UI for component library
- React Hook Form for form handling
- Zod for validation

### Backend Libraries
- Express.js for API server
- Drizzle ORM for database operations
- bcrypt for password hashing
- jsonwebtoken for JWT authentication
- WebSocket for real-time communication

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Development Mode**:
   - Uses `npm run dev` to start both frontend and backend in development mode
   - Hot module replacement for frontend code changes
   - Automatic server restart for backend changes

2. **Production Build**:
   - Frontend is built using Vite
   - Backend is bundled using esbuild
   - Static assets are served by the Express server

3. **Database**:
   - PostgreSQL database accessed via connection string in DATABASE_URL environment variable
   - Drizzle handles migrations and schema management

The deployment process is automated through Replit's configuration, with separate build and run steps defined in the .replit file.