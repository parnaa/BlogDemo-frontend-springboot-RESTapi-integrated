// API base URL - adjust this to match your SpringBoot backend
const API_BASE_URL = 'http://localhost:8080/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  
  // Blog management (Protected)
  BLOGS: `${API_BASE_URL}/blogs`,
  BLOG_BY_ID: (id) => `${API_BASE_URL}/blogs/${id}`,
  MY_BLOGS: `${API_BASE_URL}/blogs/my-blogs`,
  
  // Public blog endpoints
  PUBLIC_BLOGS: `${API_BASE_URL}/blogs/public`,
  PUBLIC_BLOG_BY_ID: (id) => `${API_BASE_URL}/blogs/public/${id}`,
  PUBLIC_BLOGS_BY_USER: (username) => `${API_BASE_URL}/blogs/public/user/${username}`,
  
  // Chat room endpoints
  CHAT_ROOMS: `${API_BASE_URL}/chat/rooms`,
  CHAT_ROOM_BY_ID: (roomId) => `${API_BASE_URL}/chat/rooms/${roomId}`,
  CHAT_ROOM_MEMBERS: (roomId) => `${API_BASE_URL}/chat/rooms/${roomId}/members`,
  JOIN_ROOM: (roomId) => `${API_BASE_URL}/chat/rooms/${roomId}/join`,
  LEAVE_ROOM: (roomId) => `${API_BASE_URL}/chat/rooms/${roomId}/leave`,
  
  // Test endpoints
  TEST: '/test',
  TEST_WEBSOCKET: '/test-websocket',
};

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  URL: 'http://localhost:8080/ws',
  TOPICS: {
    // Chat topics
    PUBLIC_CHAT: '/topic/public',
    ROOM_CHAT: (roomId) => `/topic/room/${roomId}`,
    USER_PRESENCE: '/topic/user-presence',
    TYPING: '/topic/typing',
    PRIVATE_MESSAGE: (username) => `/user/${username}/queue/private`,
    
    // Room management
    ROOM_UPDATES: '/topic/room-updates',
    NEW_ROOMS: '/topic/new-rooms',
    ROOM_LIST: '/topic/room-list',
    
    // System notifications
    SYSTEM_NOTIFICATIONS: '/topic/system-notifications',
  },
  DESTINATIONS: {
    // Chat actions
    SEND_MESSAGE: '/app/chat.sendMessage',
    ADD_USER: '/app/chat.addUser',
    TYPING: '/app/chat.typing',
    PRIVATE_MESSAGE: '/app/chat.private',
    
    // Room actions
    ROOM_SEND_MESSAGE: (roomId) => `/app/room/${roomId}/sendMessage`,
    ROOM_JOIN: (roomId) => `/app/room/${roomId}/join`,
    ROOM_LEAVE: (roomId) => `/app/room/${roomId}/leave`,
    ROOM_CREATE: '/app/room/create',
    ROOM_LIST: '/app/room/list',
    
    // Admin actions
    ADMIN_NOTIFICATION: '/app/admin.notification',
  },
};

export default API_BASE_URL;
