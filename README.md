# TaskFlow Pro API

Enterprise-Level Task Management System - Backend API

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens, email verification, RBAC
- **Task Management**: Full CRUD with filtering, search, and pagination
- **Collaboration**: Task assignment, comments, file attachments
- **Real-time Notifications**: Socket.io integration
- **Activity Logging**: Complete audit trail
- **File Upload**: Cloudinary integration for file storage

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and fill in your configuration

4. Set up the database:
```bash
# Create PostgreSQL database
createdb taskflow_db

# The database will be automatically synchronized in development mode
# For production, use migrations:
# npm run migration:run
```

5. Create admin user (optional):
```bash
npm run seed
```
This creates an admin user:
- Email: `admin@taskflow.com`
- Password: `Admin123!`

6. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/api-docs`
- Full API Documentation: See `API_DOCUMENTATION.md`

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files
├── entities/        # TypeORM entities
├── controllers/     # Route controllers
├── services/        # Business logic
├── middleware/      # Custom middleware
├── routes/          # Express routes
├── utils/           # Utility functions
├── validators/      # Zod schemas
└── server.ts        # Entry point
```

## 🔐 Roles

- **Admin**: Full access to all features
- **Manager**: Can assign tasks and manage teams
- **User**: Can view and update assigned tasks

## 🔌 WebSocket (Real-time)

The API supports real-time notifications via Socket.io. Connect with your JWT token:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_access_token'
  }
});

socket.on('notification', (data) => {
  console.log('New notification:', data);
});

socket.on('task-update', (data) => {
  console.log('Task updated:', data);
});
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Create admin user
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## 📝 Environment Variables

Copy `env.example` to `.env` and configure:
- Database credentials
- JWT secrets
- Email service (Nodemailer)
- Cloudinary credentials
- Frontend URL for CORS

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Set `synchronize: false` in database config (use migrations)
3. Build the project: `npm run build`
4. Start the server: `npm start`

## 📝 License

ISC
