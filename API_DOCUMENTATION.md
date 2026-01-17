# TaskFlow Pro API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isEmailVerified": false
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Verify Email
```
GET /api/auth/verify-email?token=<verification_token>
```

#### Refresh Token
```
POST /api/auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

#### Logout
```
POST /api/auth/logout
```
Requires authentication.

#### Get Profile
```
GET /api/auth/profile
```
Requires authentication.

### Tasks

#### Create Task
```
POST /api/tasks
```
Requires authentication.

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the project",
  "priority": "high",
  "deadline": "2024-12-31T23:59:59Z",
  "assignedToId": "user_uuid" // optional
}
```

**Priority values:** `low`, `medium`, `high`

#### Get Tasks
```
GET /api/tasks?status=todo&priority=high&search=project&page=1&limit=10
```
Requires authentication.

**Query Parameters:**
- `status`: `todo`, `in-progress`, `review`, `completed`
- `priority`: `low`, `medium`, `high`
- `assignedToId`: User UUID
- `search`: Search in title and description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### Get Task by ID
```
GET /api/tasks/:id
```
Requires authentication.

#### Update Task
```
PATCH /api/tasks/:id
```
Requires authentication.

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "medium",
  "deadline": "2024-12-31T23:59:59Z",
  "assignedToId": "user_uuid" // or null to unassign
}
```

#### Delete Task
```
DELETE /api/tasks/:id
```
Requires authentication. Only admin or task creator can delete.

### Comments

#### Create Comment
```
POST /api/comments/:taskId
```
Requires authentication.

**Request Body:**
```json
{
  "content": "This is a comment on the task"
}
```

#### Get Comments
```
GET /api/comments/:taskId
```
Requires authentication.

#### Update Comment
```
PATCH /api/comments/:id
```
Requires authentication. Only comment owner can update.

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

#### Delete Comment
```
DELETE /api/comments/:id
```
Requires authentication. Only comment owner can delete.

### Files

#### Upload File
```
POST /api/files/:taskId
```
Requires authentication.

**Request:** Multipart form data with `file` field.
- Max file size: 10MB
- Allowed types: images (jpeg, png, gif, webp) and PDFs

#### Get Files
```
GET /api/files/:taskId
```
Requires authentication.

#### Delete File
```
DELETE /api/files/:id
```
Requires authentication.

### Activity Logs

#### Get Task Activity
```
GET /api/activity/task/:taskId
```
Requires authentication.

#### Get User Activity
```
GET /api/activity/user?limit=50
```
Requires authentication.

### Users

#### Get Users
```
GET /api/users
```
Requires authentication. Only managers and admins.

#### Get User by ID
```
GET /api/users/:id
```
Requires authentication. Users can only view their own profile.

## WebSocket Events

### Connection
Connect to Socket.io server with authentication token:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_access_token'
  }
});
```

### Events

#### Join Task Room
```javascript
socket.emit('join-task', taskId);
```

#### Leave Task Room
```javascript
socket.emit('leave-task', taskId);
```

#### Receive Notifications
```javascript
socket.on('notification', (data) => {
  // Personal notifications
  console.log(data);
});

socket.on('task-update', (data) => {
  // Task room updates
  console.log(data);
});
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Role-Based Access Control

### Admin
- Full access to all features
- Can view all tasks and users
- Can delete any task

### Manager
- Can create and assign tasks
- Can view assigned tasks and team members
- Cannot delete tasks created by others

### User
- Can view only assigned tasks or tasks they created
- Can update assigned tasks
- Cannot view other users
- Cannot assign tasks
