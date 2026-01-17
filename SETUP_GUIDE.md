# TaskFlow Pro - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `env.example` to `.env` and update the following:

**Required:**
- Database credentials (PostgreSQL)
- JWT secrets (generate strong random strings)
- Email service credentials (for email verification)

**Optional (for full functionality):**
- Cloudinary credentials (for file uploads)
- Frontend URL (for CORS)

### 3. Setup Database
```bash
# Create PostgreSQL database
createdb taskflow_db

# Or using psql:
psql -U postgres
CREATE DATABASE taskflow_db;
```

### 4. Create Admin User
```bash
npm run seed
```

This creates:
- Email: `admin@taskflow.com`
- Password: `Admin123!`

**Important:** Change the admin password after first login!

### 5. Start Development Server
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## Email Configuration

For Gmail:
1. Enable 2-Step Verification
2. Generate App Password
3. Use the app password in `EMAIL_PASS`

For other providers, check Nodemailer documentation.

## Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Get your credentials from dashboard
3. Add to `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Testing the API

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 3. Create a task (use access token from login)
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My first task",
    "description": "This is a test task",
    "priority": "high"
  }'
```

## WebSocket Testing

Using Socket.io client:
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('join-task', 'TASK_ID');
});

socket.on('notification', (data) => {
  console.log('Notification:', data);
});

socket.on('task-update', (data) => {
  console.log('Task update:', data);
});
```

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Email Not Sending
- Check email credentials
- For Gmail, use App Password
- Check spam folder

### File Upload Not Working
- Verify Cloudinary credentials
- Check file size (max 10MB)
- Ensure file type is allowed (images/PDFs)

### JWT Errors
- Ensure JWT secrets are set in `.env`
- Check token expiration
- Use refresh token to get new access token

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Disable database synchronize (use migrations)
- [ ] Use strong JWT secrets
- [ ] Configure proper CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Configure rate limiting
- [ ] Set up logging
- [ ] Configure backup strategy
- [ ] Set up monitoring
