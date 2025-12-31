# Multi-Tenant Project Management System

A SaaS-style platform for managing projects and team roles across multiple organizations — built using Next.js, NestJS, TypeORM, PostgreSQL, and JWT authentication.

## 🚀 Features

- **User Authentication**: JWT-based authentication with login and registration
- **Role-Based Access Control (RBAC)**: Different permissions for Admin, Manager, and User roles
- **Project Management**: Create, update, and manage projects
- **Client Management**: Handle client information and relationships
- **User Assignment**: Assign users to projects with specific roles
- **Dashboard**: Overview of projects, clients, and team members

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Context API** - State management

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Token authentication
- **Passport** - Authentication middleware

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/RishabJha134/Cloud-Assignment-User-Management-Portal_RBAC.git
cd Cloud-Assignment-User-Management-Portal_RBAC
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the content below and create a .env file in backend directory
```

**Backend `.env` file:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=cloudflex_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=3001
```

**Create PostgreSQL Database:**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cloudflex_db;

# Exit
\q
```

**Start Backend Server:**
```bash
npm run start:dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env.local file
# Copy the content below and create a .env.local file in frontend directory
```

**Frontend `.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Start Frontend Server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🚦 Running the Application

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Clients
- `GET /clients` - Get all clients
- `POST /clients` - Create new client
- `GET /clients/:id` - Get client by ID

### Projects
- `GET /projects` - Get all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project by ID
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/assign-user` - Assign user to project
- `PUT /projects/:id/user/:userId/role` - Update user role in project

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- Manage users, projects, and clients
- Assign and modify user roles

### Manager
- Create and manage projects
- Assign users to projects
- View all clients and users

### User
- View assigned projects
- Update own profile
- Limited project access

## 📁 Project Structure

```
CloudFlexTechnology/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── clients/       # Client management
│   │   ├── projects/      # Project management
│   │   ├── entities/      # TypeORM entities
│   │   └── main.ts        # Application entry
│   ├── .env               # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities & API
│   │   └── types/         # TypeScript types
│   ├── .env.local         # Environment variables
│   └── package.json
│
└── README.md
```

## 🔧 Database Schema

### Users
- id, email, password, firstName, lastName, role (ADMIN/MANAGER/USER)

### Clients
- id, name, email, phone, company

### Projects
- id, name, description, status, clientId, startDate, endDate

### ProjectUsers (Join Table)
- projectId, userId, role (LEAD/MEMBER)

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database `cloudflex_db` exists

### Port Already in Use
- Backend: Change `PORT` in backend `.env`
- Frontend: Run `npm run dev -- -p 3001` to use different port

### CORS Errors
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check backend CORS configuration in `main.ts`

## 📝 Notes

- Database tables are automatically created by TypeORM on first run
- Default admin user can be seeded if needed
- JWT tokens expire after 24 hours (configurable)
- All passwords are hashed using bcrypt

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes with guards
- Role-based authorization
- Environment variable configuration

## 📧 Contact

For any queries regarding this project:
- Email: consult@cloudflex.co.in
- Repository: https://github.com/RishabJha134/Cloud-Assignment-User-Management-Portal_RBAC

---

**Developed for Cloud Flex Technology Internship Round 2**
