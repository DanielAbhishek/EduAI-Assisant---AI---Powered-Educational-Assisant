# Overview

EduAI Assistant is an AI-powered educational platform that provides personalized learning experiences for students and teachers. The application features essay analysis with automated feedback, adaptive quizzes that adjust to student performance, and comprehensive progress tracking. Built as a full-stack web application, it combines modern frontend technologies with a robust backend infrastructure to deliver intelligent educational tools.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a component-based architecture with the following key decisions:

- **UI Framework**: Radix UI components with shadcn/ui styling system for consistent, accessible interface components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a modular structure with reusable UI components, custom hooks for business logic, and service layers for API communication.

## Backend Architecture
The server is built with Express.js and TypeScript, following a layered architecture pattern:

- **Web Framework**: Express.js with middleware for request logging, JSON parsing, and error handling
- **Database Access**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Authentication**: Replit Auth integration using OpenID Connect with session-based authentication
- **API Design**: RESTful endpoints organized by feature domains (essays, quizzes, progress, teacher analytics)

The backend implements a storage abstraction layer that separates business logic from database implementation, making the system more maintainable and testable.

## Data Storage
PostgreSQL database with the following schema design:

- **User Management**: Users table with role-based access (student/teacher) integrated with Replit Auth
- **Educational Content**: Essays table storing student submissions with AI-generated scores and feedback
- **Assessment System**: Quizzes and quiz attempts tables for adaptive learning experiences
- **Progress Tracking**: Progress table maintaining subject-specific performance metrics
- **Session Management**: Sessions table for secure authentication state persistence

The schema uses proper foreign key relationships and includes audit fields (created_at, updated_at) for data tracking.

## AI Integration Architecture
The system is designed to incorporate AI-powered features:

- **Essay Analysis**: Placeholder implementation for grammar, structure, and creativity scoring
- **Adaptive Quizzing**: Framework for difficulty adjustment based on performance patterns
- **Progress Analytics**: Data aggregation for personalized learning insights

The AI components are abstracted through service functions, allowing for easy integration with external AI services like OpenAI or Hugging Face.

## Authentication & Authorization
Replit Auth provides the authentication foundation:

- **Identity Provider**: OpenID Connect integration with Replit's identity service
- **Session Management**: PostgreSQL-backed session store with secure cookie configuration
- **Role-Based Access**: User roles (student/teacher) control access to different features and data
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration

## Development & Deployment
The application uses modern development practices:

- **Development Server**: Vite dev server with HMR for frontend, tsx for backend development
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Database Management**: Drizzle Kit for schema migrations and database operations
- **Environment Configuration**: Environment variables for database connections and auth secrets

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM for database operations and migrations
- **express**: Web application framework for the backend API server
- **react**: Frontend UI library for component-based user interfaces

## Authentication & Security
- **openid-client**: OpenID Connect client for Replit Auth integration
- **passport**: Authentication middleware for Express applications
- **express-session**: Session management middleware with PostgreSQL storage
- **connect-pg-simple**: PostgreSQL session store for persistent authentication

## UI & Styling
- **@radix-ui/***: Comprehensive collection of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library with React components

## Data Management
- **@tanstack/react-query**: Server state management and caching for React
- **react-hook-form**: Performant form library with validation support
- **zod**: TypeScript-first schema validation library
- **date-fns**: Date utility library for formatting and manipulation

## Development Tools
- **vite**: Build tool and development server for frontend applications
- **typescript**: Static type checking for JavaScript applications
- **drizzle-kit**: CLI tools for database schema management and migrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment