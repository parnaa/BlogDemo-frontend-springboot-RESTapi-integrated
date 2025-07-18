# Blog Management System Frontend

A modern, responsive React frontend application for a blog management system with user authentication, blog CRUD operations, real-time notifications, and chat functionality.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Blog Management**: Create, read, update, and delete blog posts with rich content
- **Real-time Notifications**: Live updates for blog interactions and activities
- **Chat System**: Real-time messaging with WebSocket integration


## Tech Stack

- **Frontend**: React 18, JavaScript (ES6+)
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Real-time Communication**: WebSocket (STOMP/SockJS)
- **UI Components**: Lucide React (icons)
- **Notifications**: React Hot Toast
- **Styling**: Custom CSS with modern design patterns

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── blog/
│   │   ├── BlogList.jsx
│   │   └── CreateBlog.jsx
│   ├── chat/
│   │   └── Chat.jsx
│   ├── dashboard/
│   │   └── Dashboard.jsx
│   ├── layout/
│   │   └── Navbar.jsx
│   └── notifications/
│       └── Notifications.jsx
├── contexts/
│   └── AuthContext.jsx
├── services/
│   ├── api.js
│   └── websocket.js
├── config/
│   └── api.js
├── App.jsx
├── App.css
└── main.jsx
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Running SpringBoot backend server

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BlogReactFrontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoints:
   - Update `src/config/api.js` with your SpringBoot backend URL
   - Default backend URL is set to `http://localhost:8080/api`

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend is designed to work with a SpringBoot backend that provides:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Blog Endpoints
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/{id}` - Get specific blog
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/{id}` - Update blog
- `DELETE /api/blogs/{id}` - Delete blog
- `GET /api/blogs/my-blogs` - Get user's blogs

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read

### Chat Endpoints
- `GET /api/chat/messages` - Get chat messages
- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/rooms` - Create chat room

### WebSocket Configuration
- WebSocket endpoint: `ws://localhost:8080/ws`
- STOMP topics:
  - `/topic/notifications/{userId}` - User notifications
  - `/topic/chat/{roomId}` - Chat messages

## Features in Detail

### Authentication
- JWT-based authentication
- Persistent login sessions
- Protected routes
- User profile management

### Blog Management
- Rich text blog creation
- Image support
- Tag system
- Draft and publish functionality
- Blog statistics (views, comments, likes)

### Dashboard
- User statistics overview
- Recent blog posts
- Activity tracking
- Quick actions

### Real-time Features
- Live notifications
- Real-time chat
- WebSocket connection management
- Automatic reconnection

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interface
- Cross-browser compatibility

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

### API Configuration
Update `src/config/api.js` to match your backend configuration:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
```

## Deployment

### Production Build
```bash
npm run build
```


