import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  MessageCircle, 
  Bell, 
  User, 
  LogOut,
  Menu,
  X,
  Search,
  Plus
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    console.log('🚪 Navbar: Logout button clicked');
    console.log('  Current user:', user);
    
    await logout();
    
    console.log('🚪 Navbar: Navigating to login page');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    { path: '/public-blogs', label: 'All Blogs', icon: BookOpen },
    { path: '/blogs', label: 'My BlogS', icon: BookOpen },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, requiresAuth: true },
    { path: '/chat', label: 'Chat', icon: MessageCircle, requiresAuth: true },
    { path: '/notifications', label: 'Notifications', icon: Bell, requiresAuth: true },
  ];

  return (
    <nav className="navbar" style={{ overflow: 'visible' }}>
      <div className="navbar-container" style={{ overflow: 'visible' }}>
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <BookOpen size={24} />
            <span>BlogDemo</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          {navigationItems
            .filter(item => !item.requiresAuth || user)
            .map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <div className="navbar-search">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search blogs..."
            className="search-input"
          />
        </div>

        {/* User Menu */}
        <div className="navbar-user" style={{ position: 'relative', overflow: 'visible' }}>
          {user ? (
            <>
              <button 
                className="create-btn"
                onClick={() => navigate('/create-blog')}
              >
                <Plus size={20} />
                <span>Create</span>
              </button>
              
              <div className="user-menu" style={{ position: 'relative', overflow: 'visible' }} ref={userMenuRef}>
                <button 
                  className="user-avatar"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User size={20} />
                  <span>{user.username}</span>
                </button>
                
                {showUserMenu && (
                  <div 
                    className="user-dropdown"
                    style={{
                      position: 'fixed',
                      top: '60px',
                      right: '20px',
                      zIndex: 99999,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      minWidth: '120px',
                      padding: '4px 0'
                    }}
                  >
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item logout"
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-nav">
          {navigationItems
            .filter(item => !item.requiresAuth || user)
            .map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`mobile-nav-link ${isActive(path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
          {user ? (
            <>
              <div className="mobile-nav-divider"></div>
              <button onClick={handleLogout} className="mobile-nav-link logout">
                <LogOut size={20} />
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="mobile-nav-divider"></div>
              <Link to="/login" className="mobile-nav-link">
                <User size={20} />
                Login
              </Link>
              <Link to="/register" className="mobile-nav-link">
                <Plus size={20} />
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
