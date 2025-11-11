# Next.js Admin Auth Template - Agent Context

## Application Overview
This is a modern Next.js 15 authentication template with admin dashboard and user management capabilities, built with Better Auth, Drizzle ORM, and PostgreSQL.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Authentication**: Better Auth (email/password with admin plugin)
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS + Radix UI components
- **State Management**: Zustand
- **Icons**: Tabler Icons + Lucide React
- **Validation**: Zod schemas

## Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/auth/          # Authentication API routes
│   ├── auth/              # Login/signup pages
│   ├── dashboard/         # Protected dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix)
│   └── admin/            # Admin-specific components
├── db/                    # Database configuration
│   ├── schema.ts         # Drizzle schema
│   └── drizzle.ts        # Database connection
├── lib/                   # Utility libraries
│   ├── auth.ts           # Better Auth configuration
│   └── auth-client.ts    # Auth client setup
└── actions/              # Server actions
```

## Key Features
- 🔐 Email/password authentication with Better Auth
- 👥 Admin panel for user management (create, view, delete users)
- 📊 Dashboard with user overview and metrics
- 🎨 Modern UI with responsive design
- 🗄️ PostgreSQL database with Drizzle ORM
- 🔒 Session management with role-based access control (user/admin)
- 👑 Advanced admin features: user banning, role management, impersonation
- 📱 Mobile-friendly interface

## Authentication Flow
- Users register/login via `/auth/login` and `/auth/signup`
- Protected routes redirect to login if not authenticated
- Admin users can access `/dashboard/users` for user management
- Role-based access control with granular permissions
- Session expiry: 30 days

## Database Schema
- **user**: id, name, email, emailVerified, image, createdAt, updatedAt, role (text: user, admin), banned, banReason, banExpires
- **session**: id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId, impersonatedBy
- **account**: id, accountId, providerId, userId, accessToken, refreshToken, idToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt
- **verification**: id, identifier, value, expiresAt, createdAt, updatedAt

## User Roles
- **user**: Standard user access (default role)
- **admin**: Full access to user management, can create/delete users


## Role Management
- Roles are managed through Better Auth's admin plugin
- Admin roles are configured in `lib/auth.ts` with the `adminRoles` array
- Role-based UI elements automatically adjust based on user permissions
- Easy to extend: Add new roles by updating the `adminRoles` array and UI components

## Server Actions
- `getAllUsers()`: Fetch all users from database
- `createUser(data)`: Create new user with role assignment (user/admin)
- `deleteUser(userId)`: Delete user with confirmation

## UI Components
- **AddUser**: Floating action button with create user dialog
- **UserList**: Grid/list view of users with search, filter, and delete functionality
- **LoginForm/SignupForm**: Authentication forms with validation
- **Dashboard Layout**: Sidebar navigation with user menu

## Development Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm drizzle-kit generate` - Generate database migrations
- `pnpm drizzle-kit migrate` - Run database migrations
- `pnpm drizzle-kit studio` - Open database studio

## Package Manager
- **pnpm**: Used for dependency management and scripts

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_API_URL`: API base URL (usually http://localhost:3000)

## Security Features
- Server-side authentication validation
- Protected routes with middleware
- User banning/unbanning capabilities
- Session management with secure cookies
- Input validation with Zod schemas

## Recent Changes
- **Role System Overhaul**: Implemented proper Better Auth admin plugin role management
- **Database Schema**: Converted from PostgreSQL enum to flexible text field for roles
- **User Roles**: Streamlined to user/admin with proper authorization
- **UI Components**: Updated all role-related UI elements for consistency
- **Type Safety**: Improved TypeScript types across the role system
- **Admin Plugin**: Properly configured Better Auth admin plugin with role-based access control
- **Code Cleanup**: Removed moderator role and fixed inconsistencies across codebase