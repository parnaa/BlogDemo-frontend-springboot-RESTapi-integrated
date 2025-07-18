import { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token,
          user: JSON.parse(user),
        },
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call login API
      const response = await authAPI.login(credentials);
      
      // Handle the API response format from documentation
      const { token, type, username, expiresIn } = response;
      
      // Check if login was successful (token exists and is not null)
      if (token && token !== null && username && username !== null) {
        const user = { username, expiresIn };
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user },
        });
        
        toast.success('Login successful!');
        return { success: true };
      } else {
        // Handle 401 response where token is null
        toast.error('Invalid credentials');
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      const message = error.message || 'Login failed';
      toast.error(message);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call register API
      const response = await authAPI.register(userData);
      
      // Check if registration was successful
      if (response === 'User registered successfully') {
        toast.success('Registration successful! Please login.');
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true, message: response };
      } else if (response && response.startsWith('Error:')) {
        // Handle error messages like "Error: Username already exists"
        toast.error(response);
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: response };
      } else {
        // Handle other error cases
        toast.error('Registration failed');
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      const message = error.message || 'Registration failed';
      toast.error(message);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    console.log('🚪 Logout called');
    console.log('  Clearing token from localStorage');
    console.log('  Clearing user from localStorage');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch({ type: 'LOGOUT' });
    
    console.log('✅ Logout successful');
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
