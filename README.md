# NyxMinds Dashboard

A modern, full-featured dashboard application built with Next.js 15, featuring user management, admin panel, and secure authentication using Better Auth.

## Features

- 🔐 **Authentication**: Email/password authentication with Better Auth
- 👥 **User Management**: Admin panel for managing users, roles, and permissions
- 📊 **Dashboard**: Clean admin dashboard with metrics and user overview
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI components
- 🗄️ **Database**: PostgreSQL with Drizzle ORM
- 🔒 **Security**: Session management, user banning, and admin controls
- 📱 **Responsive**: Mobile-friendly design

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Tabler Icons & Lucide React
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm, npm, or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nyx-minds
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database URL and API settings:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nyx_minds_db"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. Set up the database:
```bash
# Generate and run migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

5. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

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

## Authentication Features

- User registration and login
- Session management (30-day expiry)
- Admin role system
- User banning/unbanning
- Password-based authentication
- Secure API routes

## Customization

### Branding
- Update `app/layout.tsx` for site metadata (already configured for NyxMinds)
- Replace logo in `public/` directory
- Modify colors in `globals.css`

### Database Schema
- Edit `db/schema.ts` to add custom fields
- Run migrations after schema changes

### UI Components
- All components are in `components/ui/`
- Customize themes in `tailwind.config.js`

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Database Commands

```bash
# Generate migrations
pnpm drizzle-kit generate

# Run migrations
pnpm drizzle-kit migrate

# View database
pnpm drizzle-kit studio
```

## Deployment

### Vercel
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Other Platforms
Ensure your deployment platform supports:
- Node.js 18+
- PostgreSQL database
- Environment variables setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this template for your projects!
