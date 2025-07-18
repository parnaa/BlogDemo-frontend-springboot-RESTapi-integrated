import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, User, LogIn, LogOut } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleBlogsClick = () => {
    console.log('📚 Blogs button clicked');
    if (isAuthenticated) {
      navigate('/blogs');
    } else {
      navigate('/public-blogs');
    }
  };

  const handleLogoutClick = async () => {
    console.log('🚪 Home: Logout button clicked');
    await logout();
    console.log('🚪 Home: User logged out, staying on home page');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '60px 40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%',
        margin: '20px'
      }}>
        {/* Logo/Title */}
        <div style={{ marginBottom: '40px' }}>
          <BookOpen size={48} style={{ color: '#007bff', marginBottom: '15px' }} />
          <h1 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '2.5rem', 
            color: '#333',
            fontWeight: 'bold'
          }}>
            BlogDemo
          </h1>
          <p style={{ 
            margin: '0', 
            color: '#666', 
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            Welcome to your personal blogging platform. Share your thoughts, ideas, and stories with the world.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleLoginClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: '500',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '140px',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {isAuthenticated ? (
              <>
                <User size={20} />
                Dashboard
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>

          <button
            onClick={handleBlogsClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: '500',
              backgroundColor: 'white',
              color: '#007bff',
              border: '2px solid #007bff',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '140px',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <BookOpen size={20} />
            Blogs
          </button>
        </div>

        {/* Logout Button - Only show if user is authenticated */}
        {isAuthenticated && (
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleLogoutClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '100px',
                justifyContent: 'center',
                margin: '0 auto'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#c82333';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div style={{ marginTop: '30px', color: '#666', fontSize: '14px' }}>
          <p>
            {isAuthenticated ? (
              <>
                Welcome back, <strong>{user?.username}</strong>! Click Dashboard to manage your blogs or browse public blogs.
              </>
            ) : (
              'New here? Create an account to start blogging or browse public blogs without signing in.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
