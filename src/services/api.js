import { API_ENDPOINTS } from '../config/api';

const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('🔑 Getting auth headers:');
  console.log('  Token exists:', !!token);
  console.log('  Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
  
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  console.log('  Headers:', headers);
  return headers;
};

// Helper function to make API requests
const apiRequest = async (url, options = {}) => {
  console.log('🌐 Making API request:');
  console.log('  URL:', url);
  console.log('  Method:', options.method || 'GET');
  console.log('  Options:', options);
  
  const requestConfig = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  console.log('  Final request config:', requestConfig);
  console.log('  Final headers:', requestConfig.headers);
  
  const response = await fetch(url, requestConfig);
  
  console.log('📥 Response received:');
  console.log('  Status:', response.status);
  console.log('  Status text:', response.statusText);
  console.log('  Headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    console.error('❌ Request failed:');
    console.error('  Status:', response.status);
    console.error('  Status text:', response.statusText);
    
    if (response.status === 401) {
      console.log('🔐 Unauthorized - clearing token and redirecting to login');
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(`API Error: ${response.status}`);
  }

  // Handle responses with no content (like 204 No Content for DELETE)
  const contentType = response.headers.get('content-type');
  const hasJsonContent = contentType && contentType.includes('application/json');
  
  // If there's no content or it's not JSON, return a success object
  if (response.status === 204 || !hasJsonContent) {
    console.log('✅ Request successful - No content response');
    return { success: true, status: response.status };
  }

  const data = await response.json();
  console.log('✅ Request successful - Response data:', data);
  return data;
};

// Authentication API calls (public)
export const authAPI = {
  login: async (credentials) => {
    console.log('🔐 Login API call:');
    console.log('  Credentials:', credentials);
    console.log('  URL:', `${API_BASE_URL}/auth/login`);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('📥 Login response:');
    console.log('  Status:', response.status);
    console.log('  Status text:', response.statusText);
    
    const data = await response.json();
    console.log('  Response data:', data);
    
    // Handle both success and error cases
    if (response.ok) {
      console.log('✅ Login successful');
      return data; // Returns { token, type, username, expiresIn }
    } else if (response.status === 401) {
      console.log('❌ Login failed - Invalid credentials');
      // Return the error response format from documentation
      return data; // Returns { token: null, type: "Bearer", username: null, expiresIn: 0 }
    } else {
      console.error('❌ Login failed with status:', response.status);
      throw new Error(`Login failed: ${response.status}`);
    }
  },

  register: async (userData) => {
    console.log('📝 Register API call:');
    console.log('  User data:', userData);
    console.log('  URL:', `${API_BASE_URL}/auth/register`);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    console.log('📥 Register response:');
    console.log('  Status:', response.status);
    console.log('  Status text:', response.statusText);
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Registration successful:', data);
      return data; // Returns string message like "User registered successfully"
    } else if (response.status === 400) {
      const data = await response.text();
      console.log('❌ Registration failed:', data);
      return data; // Returns error message like "Error: Username already exists"
    } else {
      console.error('❌ Registration failed with status:', response.status);
      throw new Error(`Registration failed: ${response.status}`);
    }
  },
};

// Blog API calls
export const blogAPI = {
  // Public blog operations (no auth required)
  getPublicBlogs: () => {
    console.log('📚 Getting public blogs (no auth)');
    return apiRequest(`${API_BASE_URL}/blogs/public`);
  },
  
  getPublicBlogById: (id) => {
    console.log('📚 Getting public blog by ID:', id);
    return apiRequest(`${API_BASE_URL}/blogs/public/${id}`);
  },
  
  getPublicBlogsByUser: (username) => {
    console.log('📚 Getting public blogs by user:', username);
    return apiRequest(`${API_BASE_URL}/blogs/public/user/${username}`);
  },
  
  getAllBlogs: () => {
    console.log('📚 Getting all blogs (alias for public)');
    return apiRequest(`${API_BASE_URL}/blogs/public`);
  }, // Alias for public blogs
  
  getBlogsByUser: (username) => {
    console.log('📚 Getting blogs by user (alias):', username);
    return apiRequest(`${API_BASE_URL}/blogs/public/user/${username}`);
  }, // Alias for compatibility
  
  // Protected blog operations (require authentication)
  createBlog: (blogData) => {
    console.log('📝 Creating blog (protected):');
    console.log('  Blog data:', blogData);
    console.log('  URL:', `${API_BASE_URL}/blogs`);
    
    // Get auth headers and log them
    const authHeaders = getAuthHeaders();
    console.log('  Auth headers:', authHeaders);
    
    return apiRequest(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(blogData),
    });
  },
  
  updateBlog: (id, blogData) => {
    console.log('✏️ Updating blog (protected):');
    console.log('  Blog ID:', id);
    console.log('  Blog data:', blogData);
    console.log('  URL:', `${API_BASE_URL}/blogs/${id}`);
    
    return apiRequest(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData),
    });
  },
  
  deleteBlog: (id) => {
    console.log('🗑️ Deleting blog (protected):');
    console.log('  Blog ID:', id);
    console.log('  URL:', `${API_BASE_URL}/blogs/${id}`);
    
    return apiRequest(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
  
  getMyBlogs: () => {
    console.log('📚 Getting my blogs (protected)');
    console.log('  URL:', `${API_BASE_URL}/blogs/my-blogs`);
    
    return apiRequest(`${API_BASE_URL}/blogs/my-blogs`, {
      headers: getAuthHeaders(),
    });
  },
  
  getBlogById: (id) => {
    console.log('📚 Getting blog by ID (protected):');
    console.log('  Blog ID:', id);
    console.log('  URL:', `${API_BASE_URL}/blogs/${id}`);
    
    return apiRequest(`${API_BASE_URL}/blogs/${id}`, {
      headers: getAuthHeaders(),
    });
  },
};

// Chat API calls
export const chatAPI = {
  // Room management (GET operations are public)
  getRooms: () => {
    console.log('💬 Getting chat rooms (public)');
    return apiRequest(`${API_BASE_URL}/chat/rooms`);
  },
  
  getRoomById: (roomId) => {
    console.log('💬 Getting chat room by ID (public):', roomId);
    return apiRequest(`${API_BASE_URL}/chat/rooms/${roomId}`);
  },
  
  getRoomMembers: (roomId) => {
    console.log('💬 Getting room members (public):', roomId);
    return apiRequest(`${API_BASE_URL}/chat/rooms/${roomId}/members`);
  },
  
  // Protected operations require authentication
  createRoom: (roomData) => {
    console.log('💬 Creating chat room (protected):');
    console.log('  Room data:', roomData);
    
    return apiRequest(`${API_BASE_URL}/chat/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData),
    });
  },
  
  joinRoom: (roomId) => {
    console.log('💬 Joining chat room (protected):', roomId);
    
    return apiRequest(`${API_BASE_URL}/chat/rooms/${roomId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },
  
  leaveRoom: (roomId) => {
    console.log('💬 Leaving chat room (protected):', roomId);
    
    return apiRequest(`${API_BASE_URL}/chat/rooms/${roomId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },
};

// Test API calls (public - note: no /api prefix)
export const testAPI = {
  healthCheck: () => {
    console.log('🏥 Health check (public)');
    return apiRequest(`http://localhost:8080/test`);
  },
  
  websocketTest: () => {
    console.log('🔌 WebSocket test (public)');
    return apiRequest(`http://localhost:8080/test-websocket`);
  },
};

export default { authAPI, blogAPI, chatAPI, testAPI };
