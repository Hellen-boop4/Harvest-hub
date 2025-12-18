# 🌾 Harvest Hub - Agricultural Management System

A comprehensive web-based platform for managing dairy farming operations, milk collection, farmer profiles, loans, and financial tracking. Built with modern web technologies for optimal performance and user experience.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Configuration](#configuration)
- [Project Architecture](#project-architecture)
- [Key Components](#key-components)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Support](#support)

---

## 🎯 Overview

**Harvest Hub** is a full-stack agricultural management system designed specifically for dairy farming operations. It provides farmers, farm managers, and finance teams with an intuitive platform to:

- Register and manage farmer profiles
- Track daily milk collections
- Process loan applications and payments
- Generate financial reports
- Monitor production statistics
- Manage payouts to farmers

The system is built with a focus on **user-friendliness**, **accessibility**, and **data accuracy** for users in various tech proficiency levels.

---

## ✨ Features

### 🏠 Dashboard
- **Real-time Statistics**: Total farmers, daily collections, active loans, monthly revenue
- **Visual Analytics**: Pie charts for farmers by region, collection distribution, and loan status
- **Monthly Progress**: Bar chart showing collection trends vs. targets
- **Activity Feed**: Recent system events and transactions
- **Quick Access Cards**: Shortcuts to main modules
- **System Status**: Live system health indicators

### 👨‍🌾 Farmer Management
- Complete farmer profiles with contact information
- Registration and verification system
- Farmer performance tracking
- Search and filter capabilities
- Regional organization by collection zones

### 🥛 Milk Collection & Tracking
- Daily milk collection recording
- Quality inspection and grading
- Collection distribution analysis (morning/evening splits)
- Regional collection statistics
- Historical collection reports

### 💰 Loan Management
- Loan application processing
- Loan status tracking (active, paid, overdue)
- Payment scheduling and tracking
- Loan amount and term management
- Default risk assessment

### 📊 Financial Reporting
- Monthly revenue reports
- Farmer payout history
- Collection value analysis
- Loan repayment schedules
- Financial forecasting

### 🎨 User Experience
- **Animated Interactions**: Smooth transitions and visual feedback
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Eye-friendly interface
- **Real-time Updates**: Live data synchronization
- **Intuitive Navigation**: Clear menu structure and breadcrumb navigation
- **Form Validation**: Instant feedback on input errors
- **Loading States**: Visual indicators during data fetching

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (Lightning-fast HMR)
- **UI Library**: Shadcn/ui (Radix UI based)
- **Styling**: Tailwind CSS 3
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter (Lightweight)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios (built-in fetch)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (minimal setup)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT + Session-based
- **Password Hashing**: Bcryptjs
- **Development**: tsx (TypeScript executor)

### DevOps & Build
- **Package Manager**: npm
- **Database Migrations**: Drizzle Kit
- **Build Process**: ESBuild (production)
- **Environment Management**: .env files

---

## 📁 Project Structure

```
harvest-hub/
├── client/                          # Frontend React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn UI components
│   │   │   │   ├── animated-stat-card.tsx
│   │   │   │   ├── quick-action-card.tsx
│   │   │   │   ├── activity-feed.tsx
│   │   │   │   ├── status-badge.tsx
│   │   │   │   ├── breadcrumb-nav.tsx
│   │   │   │   ├── loading-skeleton.tsx
│   │   │   │   ├── data-grid.tsx
│   │   │   │   ├── metric-comparison.tsx
│   │   │   │   └── task-list.tsx
│   │   │   └── examples/            # Example components
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx             # Dashboard
│   │   │   ├── Login.tsx            # Authentication
│   │   │   ├── farmers/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── FarmersList.tsx
│   │   │   │   ├── FarmerProfile.tsx
│   │   │   │   └── FarmerRegistration.tsx
│   │   │   ├── milk/
│   │   │   │   ├── AddMilk.tsx
│   │   │   │   ├── MilkCollection.tsx
│   │   │   │   ├── MilkList.tsx
│   │   │   │   ├── MilkPayout.tsx
│   │   │   │   ├── MilkCollectionReports.tsx
│   │   │   │   └── MilkPayoutReports.tsx
│   │   │   ├── loans/
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── finance/
│   │   │   │   └── Dashboard.tsx
│   │   │   └── not-found.tsx
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.tsx
│   │   │   └── FarmersContext.tsx
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── lib/                     # Utilities
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   └── public/
├── server/                          # Backend Node.js Application
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # API routes
│   ├── db.ts                        # Database configuration
│   ├── storage.ts                   # In-memory storage
│   ├── auth-storage.ts              # Auth data storage
│   ├── middleware/
│   │   └── auth.ts                  # Authentication middleware
│   └── models/
│       ├── User.ts
│       └── Farmer.ts
├── shared/                          # Shared code
│   └── schema.ts                    # Zod validation schemas
├── attached_assets/                 # Generated images and resources
│   └── generated_images/
├── package.json                     # Project dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── vite.config.ts                   # Vite configuration
├── drizzle.config.ts                # Drizzle ORM configuration
├── postcss.config.js                # PostCSS configuration
└── README.md                        # This file
```

---

## 📥 Installation

### Prerequisites
- **Node.js** 18+ 
- **npm** 9+
- **PostgreSQL** 12+ (for production)

### Step 1: Navigate to Project Directory
```bash
cd harvest-hub
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs dependencies for both frontend and backend (monorepo setup).

### Step 3: Environment Configuration
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/harvest_hub

# Node Environment
NODE_ENV=development

# Server Port
PORT=5000

# JWT
JWT_SECRET=your-secret-key-here

# API Base URL (Frontend)
VITE_API_URL=http://localhost:5000
```

### Step 4: Database Setup
```bash
npm run db:push
```

This creates tables and runs migrations using Drizzle Kit.

---

## 🚀 Running the Project

### Development Mode
Run both frontend and backend simultaneously:

```bash
npm run dev
```

This starts:
- **Frontend**: Vite dev server on `http://localhost:5173`
- **Backend**: Node server on `http://localhost:5000`

### Frontend Only
```bash
npm run dev:frontend
```
Access at: `http://localhost:5173`

### Backend Only
```bash
npm run dev:backend
```
Access at: `http://localhost:5000`

### Production Build
```bash
npm run build
```

### Type Checking
```bash
npm run check
```

---

## ⚙️ Configuration

### Tailwind CSS
Configured in `tailwind.config.ts` with:
- Custom color scheme (green-based)
- Extended animations and transitions
- Responsive breakpoints
- Accessibility features

### Vite
Configured in `vite.config.ts` with:
- Path aliases (`@` → client/src, `@shared` → shared)
- API proxy to backend at `/api`
- Optimized build settings

### TypeScript
Configured in `tsconfig.json` with:
- Strict type checking
- ES2020 target
- Module resolution for paths

---

## 🏗 Project Architecture

### Frontend Architecture
```
Client Layer (React)
    ↓
Context/State Management (React Query, Context API)
    ↓
API Services (Fetch/Axios)
    ↓
HTTP Client
    ↓
Backend Server
```

### Backend Architecture
```
Express Server
    ↓
Routes & Middleware
    ↓
Controllers (Business Logic)
    ↓
Database Models (Drizzle ORM)
    ↓
PostgreSQL Database
```

### Data Flow
1. **User Action** → React Component
2. **State Update** → React Context/Query
3. **API Request** → Backend Endpoint
4. **Database Operation** → Query/Mutation
5. **Response** → Frontend Update
6. **Render** → UI Display

---

## 🧩 Key Components

### Dashboard Components
- **AnimatedStatCard**: Displays key metrics with trend indicators
- **QuickActionCard**: Navigation shortcuts to main modules
- **ActivityFeed**: Real-time activity log
- **StatusBadge**: Live status indicators with animations
- **DataGrid**: Interactive sortable data table

### Form Components
- **FormInput**: Enhanced input with validation
- **FormSelect**: Dropdown with filtering
- **FormCheckbox**: Toggle controls
- **FormDatePicker**: Date selection

### Layout Components
- **Navigation**: Top navigation with dropdown menus
- **Sidebar**: Module navigation (extensible)
- **BreadcrumbNav**: Navigation trail
- **Card**: Content containers

---

## 🗄 Database Schema

### Main Tables

#### Users
```sql
- id (UUID, PK)
- username (STRING, UNIQUE)
- email (STRING, UNIQUE)
- password (STRING, hashed)
- role (ENUM: admin, manager, viewer)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### Farmers
```sql
- id (UUID, PK)
- name (STRING)
- phone (STRING)
- email (STRING)
- location (STRING)
- region (STRING)
- bankAccount (STRING)
- status (ENUM: active, inactive, suspended)
- joinDate (DATE)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### Milk Collections
```sql
- id (UUID, PK)
- farmerId (UUID, FK)
- quantity (DECIMAL)
- quality (ENUM: A, B, C)
- collectionDate (DATE)
- timeOfDay (ENUM: morning, evening)
- price (DECIMAL)
- createdAt (TIMESTAMP)
```

#### Loans
```sql
- id (UUID, PK)
- farmerId (UUID, FK)
- amount (DECIMAL)
- interestRate (DECIMAL)
- term (INTEGER, months)
- status (ENUM: active, paid, overdue, defaulted)
- issuedDate (DATE)
- dueDate (DATE)
- createdAt (TIMESTAMP)
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### Farmers
- `GET /api/farmers` - List all farmers
- `POST /api/farmers` - Create new farmer
- `GET /api/farmers/:id` - Get farmer details
- `PUT /api/farmers/:id` - Update farmer
- `DELETE /api/farmers/:id` - Delete farmer

### Milk Collections
- `GET /api/milk` - List all collections
- `POST /api/milk` - Record new collection
- `GET /api/milk/:id` - Get collection details
- `PUT /api/milk/:id` - Update collection
- `GET /api/milk/reports/monthly` - Monthly report

### Loans
- `GET /api/loans` - List all loans
- `POST /api/loans` - Create new loan
- `GET /api/loans/:id` - Get loan details
- `PUT /api/loans/:id` - Update loan status
- `POST /api/loans/:id/payment` - Record payment

### Finance
- `GET /api/finance/dashboard` - Financial overview
- `GET /api/finance/reports` - Generate reports
- `GET /api/finance/payouts` - Farmer payouts

---

## 🔐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Harvest Hub
```

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/harvest_hub
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

---

## 🎨 Design System

### Color Scheme
- **Primary**: Green (#16a34a) - Trust, growth, agriculture
- **Secondary**: Light Green (#22c55e) - Positive actions
- **Accent**: Various greens and alerts
- **Neutral**: Grays for text and backgrounds

### Typography
- **Headings**: Bold, hierarchical
- **Body**: Clear, readable
- **Code**: Monospace for technical content

### Spacing
- Base unit: 4px
- Padding: 4, 8, 12, 16, 24, 32px
- Margins: Similar scale

### Animations
- Smooth transitions (200ms)
- Page animations (400ms)
- Loading states with spinners
- Hover effects on interactive elements

---

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

---

## 🤝 Contributing

### Code Standards
- Follow ESLint configuration
- Use TypeScript strict mode
- Add tests for new features
- Document your changes clearly

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env or server/index.ts
PORT=5001 npm run dev
```

### Database Connection Error
```bash
# Verify DATABASE_URL in .env
# Ensure PostgreSQL is running
# Check credentials and host
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear dist and rebuild
rm -rf dist
npm run build
```

---

## 📞 Support & Contact

- **Documentation**: See `/docs` folder
- **Email**: support@harvesthub.local
- **Bug Reports**: Include error logs and reproduction steps

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with React, Vite, and Tailwind CSS
- UI Components from Shadcn/UI
- Icons from Lucide React
- Charts from Recharts
- Data visualization powered by modern web APIs

---

## 📈 Roadmap

### Q1 2025
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Q2 2025
- [ ] Offline mode
- [ ] AI-powered forecasting
- [ ] Integration with payment providers
- [ ] Advanced reporting features

### Q3 2025
- [ ] Blockchain integration
- [ ] IoT device support
- [ ] API rate limiting
- [ ] Advanced security features

---

**Last Updated**: December 4, 2025

**Version**: 1.0.0

**Status**: Production Ready ✅
