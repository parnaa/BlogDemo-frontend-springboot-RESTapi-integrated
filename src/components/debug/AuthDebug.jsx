import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { blogAPI } from '../../services/api';

const AuthDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const [tokenInfo, setTokenInfo] = useState({});
  const [apiTest, setApiTest] = useState(null);

  useEffect(() => {
    // Check localStorage token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    setTokenInfo({
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'No token',
      hasUser: !!userData,
      userPreview: userData ? userData.substring(0, 100) + '...' : 'No user data'
    });
  }, []);

  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:8080/test');
      const data = await response.text();
      console.log('Backend test response:', data);
      setApiTest({
        success: response.ok,
        data: data,
        status: response.status
      });
    } catch (error) {
      console.error('Backend test failed:', error);
      setApiTest({
        success: false,
        error: error.message,
        status: 'Connection failed'
      });
    }
  };

  const testProtectedAPI = async () => {
    try {
      const response = await blogAPI.getMyBlogs();
      setApiTest({
        success: true,
        data: response,
        status: 200
      });
    } catch (error) {
      setApiTest({
        success: false,
        error: error.message,
        status: 'API Error'
      });
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpass'
        })
      });
      
      const data = await response.json();
      console.log('Login test response:', data);
      
      if (response.ok && data.token && data.token !== null) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ username: data.username }));
        setTokenInfo({
          hasToken: true,
          tokenPreview: data.token.substring(0, 50) + '...',
          hasUser: true,
          userPreview: JSON.stringify({ username: data.username })
        });
        console.log('Login successful!');
      } else {
        console.log('Login failed:', data);
      }
    } catch (error) {
      console.error('Login test failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Authentication Debug</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h4>Context State</h4>
        <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? JSON.stringify(user) : 'No user'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h4>localStorage</h4>
        <p>Has Token: {tokenInfo.hasToken ? 'Yes' : 'No'}</p>
        <p>Token Preview: {tokenInfo.tokenPreview}</p>
        <p>Has User: {tokenInfo.hasUser ? 'Yes' : 'No'}</p>
        <p>User Preview: {tokenInfo.userPreview}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testLogin} style={{ marginRight: '10px' }}>
          Test Login
        </button>
        <button onClick={testBackend} style={{ marginRight: '10px' }}>
          Test Backend
        </button>
        <button onClick={testProtectedAPI}>
          Test Protected API
        </button>
      </div>

      {apiTest && (
        <div style={{ padding: '10px', border: '1px solid #ccc' }}>
          <h4>API Test Result</h4>
          <p>Success: {apiTest.success ? 'Yes' : 'No'}</p>
          <p>Status: {apiTest.status}</p>
          <pre>{JSON.stringify(apiTest, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
