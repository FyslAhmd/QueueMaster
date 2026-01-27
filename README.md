# Smart Appointment & Queue Manager

A comprehensive web application for managing appointments, staff, services, and customer queues. Built with Next.js 16, MongoDB Atlas, and NextAuth.js for secure authentication.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=flat-square&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8-green?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- 🔐 **Secure Authentication** - NextAuth.js v5 with JWT tokens and bcrypt password hashing
- 👥 **Staff Management** - Add, edit, and manage staff members with specializations
- 📅 **Appointment Scheduling** - Create and manage appointments with conflict detection
- 🎯 **Service Configuration** - Define services with durations and pricing
- 📊 **Queue Management** - Smart auto-assign or manual assignment of queue entries
- 📈 **Activity Logging** - Comprehensive audit trail of all system activities
- 🎨 **Modern UI** - Dark glassmorphism theme with Framer Motion animations
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** NextAuth.js v5 (Credentials provider)
- **State Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS 4 with custom dark theme
- **Animations:** Framer Motion
- **Validation:** Zod with React Hook Form
- **HTTP Client:** Axios with interceptors
- **Date Utilities:** date-fns

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd appointment-queue-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/appointment-queue-manager

# NextAuth.js Configuration
# Generate a secure secret using: openssl rand -base64 32
NEXTAUTH_SECRET=your-super-secret-key-here

# Application URLs
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create an account

1. Navigate to the landing page
2. Click "Get Started" or go to `/register`
3. Create an account with email and password
4. Login and start managing appointments!

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   │   └── dashboard/      # Dashboard pages
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── appointments/   # Appointment CRUD
│   │   ├── services/       # Service CRUD
│   │   ├── staff/          # Staff CRUD
│   │   ├── queue/          # Queue management
│   │   └── activity/       # Activity log
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Landing page
├── components/             # React components
│   └── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
│   └── use*.ts             # TanStack Query hooks
├── lib/                    # Utilities and configuration
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # MongoDB connection
│   ├── errors.ts           # Custom error classes
│   └── validations/        # Zod schemas
├── models/                 # Mongoose models
├── providers/              # React context providers
└── types/                  # TypeScript type definitions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers (signin, signout, session)

### Staff
- `GET /api/staff` - List all staff
- `POST /api/staff` - Create staff member
- `PUT /api/staff/[id]` - Update staff member
- `DELETE /api/staff/[id]` - Delete staff member

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### Appointments
- `GET /api/appointments` - List appointments (with filters)
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Cancel appointment

### Queue
- `GET /api/queue` - Get waiting queue
- `POST /api/queue` - Assign from queue (auto or manual)

### Activity
- `GET /api/activity` - Get activity log (with pagination)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Development Commands

```bash
# Development
npm run dev         # Start development server

# Production
npm run build       # Build for production
npm run start       # Start production server

# Linting
npm run lint        # Run ESLint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Docker

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL for client | Yes |

## Security Features

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT-based session tokens (30-day expiry)
- ✅ Protected API routes with authentication middleware
- ✅ Input validation with Zod schemas
- ✅ Mongoose sanitization against NoSQL injection
- ✅ CORS protection via Next.js API routes
- ✅ HTTP-only cookies for session management

## License

MIT License - feel free to use this project for personal or commercial purposes.
