import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Search, 
  Filter, 
  Plus,
  BookOpen
} from 'lucide-react';

const BlogList = ({ isPublic = false, onBlogClick }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, sortBy, filterBy, searchTerm, isPublic]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 BlogList: Starting fetchBlogs');
      console.log('  isPublic:', isPublic);
      
      // Use different API endpoints based on isPublic prop
      let blogs;
      if (isPublic) {
        console.log('🌍 BlogList: Calling getPublicBlogs()');
        blogs = await blogAPI.getPublicBlogs();
        console.log('✅ BlogList: getPublicBlogs() returned:', blogs);
      } else {
        console.log('🔒 BlogList: Calling getMyBlogs()');
        blogs = await blogAPI.getMyBlogs();
        console.log('✅ BlogList: getMyBlogs() returned:', blogs);
      }
      
      // Filter and sort blogs on the frontend since the API doesn't support pagination
      let filteredBlogs = blogs || [];
      
      // Apply search filter
      if (searchTerm) {
        filteredBlogs = filteredBlogs.filter(blog =>
          (blog.title && blog.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (blog.content && blog.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (blog.user?.username || blog.author || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'title':
          filteredBlogs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          break;
        case 'author':
          filteredBlogs.sort((a, b) => 
            (a.user?.username || a.author || '').localeCompare(b.user?.username || b.author || '')
          );
          break;
        default:
          // Default sort by ID (assuming newer posts have higher IDs)
          filteredBlogs.sort((a, b) => (b.id || 0) - (a.id || 0));
          break;
      }
      
      // Pagination
      const startIndex = (currentPage - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);
      
      setBlogs(paginatedBlogs);
      setTotalPages(Math.ceil(filteredBlogs.length / 10));
    } catch (error) {
      console.error('❌ BlogList: Error fetching blogs:', error);
      console.error('  Error name:', error.name);
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
      console.error('  isPublic was:', isPublic);
      
      // Fallback to mock data if backend is not available
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        console.log('📡 BlogList: Backend connection issue, using mock blogs');
        const mockBlogs = [
          {
            id: 1,
            title: 'Welcome to Our Blog Platform',
            content: 'This is a sample blog post to demonstrate the functionality. You can create, edit, and delete blog posts.',
            author: 'admin',
            user: { username: 'admin' },
            isPublic: true
          },
          {
            id: 2,
            title: 'Getting Started with React',
            content: 'Learn how to build amazing applications with React. This comprehensive guide covers everything you need to know.',
            author: 'developer',
            user: { username: 'developer' },
            isPublic: true
          }
        ];
        setBlogs(mockBlogs);
        setTotalPages(1);
      } else {
        toast.error('Failed to load blogs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blogId) => {
    console.log('🔍 BlogList: handleBlogClick called with ID:', blogId);
    console.log('🔍 BlogList: onBlogClick prop:', onBlogClick);
    
    if (onBlogClick) {
      console.log('🔍 BlogList: Using onBlogClick prop');
      onBlogClick(blogId);
    } else {
      console.log('🔍 BlogList: Navigating to /blog/' + blogId);
      navigate(`/blog/${blogId}`);
    }
  };

  const handleCreateBlog = () => {
    navigate('/create-blog');
  };

  const truncateContent = (content, maxLength = 200) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="blog-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-list-container">
      <div className="blog-list-header">
        <h1>
          <BookOpen size={28} />
          {isPublic ? 'Public Blogs' : 'My Blogs'}
        </h1>
        {user && (
          <button 
            className="create-blog-btn"
            onClick={handleCreateBlog}
          >
            <Plus size={20} />
            Create Blog
          </button>
        )}
      </div>

      <div className="blog-filters">
        <div className="search-section">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
          </div>
        </div>
      </div>

      <div className="blog-grid">
        {blogs.length === 0 ? (
          <div className="no-blogs">
            <BookOpen size={48} className="no-blogs-icon" />
            <h3>No blogs found</h3>
            <p>{isPublic ? 'No public blogs available yet.' : 'You haven\'t created any blogs yet.'}</p>
            {user && (
              <button 
                className="create-first-blog-btn"
                onClick={handleCreateBlog}
              >
                {isPublic ? 'Create Your First Blog' : 'Create Your First Blog'}
              </button>
            )}
          </div>
        ) : (
          blogs.map((blog) => (
            <div 
              key={blog.id} 
              className="blog-card"
              onClick={() => handleBlogClick(blog.id)}
            >
              {blog.imageUrl && (
                <div className="blog-image">
                  <img src={blog.imageUrl} alt={blog.title || 'Blog image'} />
                </div>
              )}
              
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-author">
                    <User size={14} />
                    {blog.user?.username || 'Anonymous'}
                  </span>
                </div>
                
                <h3 className="blog-title">{blog.title || 'Untitled Blog'}</h3>
                
                <p className="blog-excerpt">
                  {truncateContent(blog.content || '')}
                </p>
                
                <div className="blog-tags">
                  {blog.tags && blog.tags.map((tag, index) => (
                    <span key={index} className="blog-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;
