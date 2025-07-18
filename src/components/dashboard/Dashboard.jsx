import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { blogAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen,
  Bell,
  TrendingUp,
  User,
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const [myBlogs, setMyBlogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('blogs');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🏠 Dashboard: Starting to fetch dashboard data');
      setLoading(true);
      
      // Check token before making request
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('🏠 Dashboard: Token exists:', !!token);
      console.log('🏠 Dashboard: User exists:', !!user);
      
      if (!token) {
        console.error('🏠 Dashboard: No token found, cannot fetch protected data');
        toast.error('Please log in to view your dashboard');
        return;
      }
      
      // Fetch user's blogs
      console.log('🏠 Dashboard: Calling blogAPI.getMyBlogs()');
      const blogs = await blogAPI.getMyBlogs();
      console.log('🏠 Dashboard: Received blogs:', blogs);
      
      setMyBlogs(blogs);
      
      console.log('🏠 Dashboard: Data fetched successfully');
      
    } catch (error) {
      console.error('🏠 Dashboard: Error fetching dashboard data:', error);
      console.error('🏠 Dashboard: Error details:', error.message);
      console.error('🏠 Dashboard: Error stack:', error.stack);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogAPI.deleteBlog(blogId);
        setMyBlogs(prev => prev.filter(blog => blog.id !== blogId));
        toast.success('Blog deleted successfully');
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
      }
    }
  };

  const handleEditBlog = (blogId) => {
    navigate(`/edit-blog/${blogId}`);
  };

  const handleViewBlog = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <User size={28} />
            Dashboard
          </h1>
          <p>Welcome back, {user.username}!</p>
        </div>
        <button 
          className="create-blog-btn"
          onClick={() => navigate('/create-blog')}
        >
          <Plus size={20} />
          Create New Blog
        </button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('blogs')}
        >
          <BookOpen size={18} />
          My Blogs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={18} />
          Notifications
        </button>
      </div>

      {activeTab === 'blogs' && (
        <div className="dashboard-content">
          <div className="blogs-section">
            <div className="section-header">
              <h2>My Blogs ({myBlogs.length})</h2>
              <button 
                className="create-blog-btn"
                onClick={() => navigate('/create-blog')}
              >
                <Plus size={20} />
                Create New Blog
              </button>
            </div>
            
            {myBlogs.length === 0 ? (
              <div className="no-blogs">
                <BookOpen size={48} className="no-blogs-icon" />
                <h3>No blogs yet</h3>
                <p>Start creating your first blog post!</p>
                <button 
                  className="create-first-blog-btn"
                  onClick={() => navigate('/create-blog')}
                >
                  Create Your First Blog
                </button>
              </div>
            ) : (
              <div className="blogs-grid">
                {myBlogs.map(blog => (
                  <div key={blog.id} className="blog-card">
                    {blog.imageUrl && (
                      <div className="blog-image">
                        <img src={blog.imageUrl} alt={blog.title} />
                      </div>
                    )}
                    
                    <div className="blog-content">
                      <div className="blog-header">
                        <h3>{blog.title}</h3>
                        <span className={`blog-status ${blog.status}`}>
                          {blog.status}
                        </span>
                      </div>
                      
                      <div className="blog-actions">
                        <button 
                          onClick={() => handleViewBlog(blog.id)}
                          className="action-btn view-btn"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button 
                          onClick={() => handleEditBlog(blog.id)}
                          className="action-btn edit-btn"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="action-btn delete-btn"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="dashboard-content">
          <div className="notifications-section">
            <h2>Recent Notifications</h2>
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={48} className="no-notifications-icon" />
                <h3>No notifications</h3>
                <p>You're all caught up!</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-content">
                      <p>{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
