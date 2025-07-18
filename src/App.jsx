import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './components/pages/Home';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import BlogList from './components/blog/BlogList';
import BlogPost from './components/blog/BlogPost';
import PublicBlogList from './components/blog/PublicBlogList';
import CreateBlog from './components/blog/CreateBlog';
import Chat from './components/chat/Chat';
import Notifications from './components/notifications/Notifications';
import TestConnection from './components/test/TestConnection';
import PublicBlogTest from './components/test/PublicBlogTest';
import AuthDebug from './components/debug/AuthDebug';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Toaster position="top-right" />
          
          <Routes>
            {/* Home Route */}
            <Route 
              path="/" 
              element={<Home />} 
            />
            
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Public Blog Routes */}
            <Route 
              path="/public-blogs" 
              element={<PublicBlogList />} 
            />
            <Route 
              path="/public-blog/:id" 
              element={<BlogPost />} 
            />
            
            {/* Test Route - Always accessible */}
            <Route 
              path="/test" 
              element={
                <div>
                  <Navbar />
                  <div className="main-content">
                    <TestConnection />
                  </div>
                </div>
              } 
            />
            
            {/* Public Blog Test Route */}
            <Route 
              path="/test-public" 
              element={
                <div>
                  <div className="main-content">
                    <PublicBlogTest />
                  </div>
                </div>
              } 
            />
            
            {/* Debug Route - Remove in production */}
            <Route 
              path="/debug" 
              element={<AuthDebug />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="main-content">
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/blogs" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="main-content">
                    <BlogList isPublic={false} />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/blog/:id" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="main-content">
                    <BlogPost />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/create-blog" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="main-content">
                    <CreateBlog />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/edit-blog/:id" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="main-content">
                    <CreateBlog />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="main-content">
                    <Chat />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="main-content">
                    <Notifications />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Default Routes */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
