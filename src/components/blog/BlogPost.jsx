import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  User, 
  ArrowLeft,
  BookOpen
} from 'lucide-react';

const BlogPost = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  console.log('🔍 BlogPost: Component rendered with ID:', id);

  useEffect(() => {
    console.log('🔍 BlogPost: useEffect triggered with ID:', id);
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let blogData;
      if (isAuthenticated) {
        // Try to get protected blog first
        try {
          blogData = await blogAPI.getBlogById(id);
        } catch (err) {
          // If protected call fails, try public
          blogData = await blogAPI.getPublicBlogById(id);
        }
      } else {
        // Get public blog
        blogData = await blogAPI.getPublicBlogById(id);
      }
      
      setBlog(blogData);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog post');
      toast.error('Blog not found or failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-post-container">
        <div className="error-message">
          <BookOpen size={48} className="error-icon" />
          <h3>Blog Post Not Found</h3>
          <p>{error || 'The blog post you are looking for does not exist.'}</p>
          <button 
            onClick={handleGoBack}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      <div className="blog-post-header">
        <button 
          onClick={handleGoBack}
          className="back-button"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <article className="blog-post">
        <header className="blog-post-meta">
          <h1 className="blog-post-title">{blog.title}</h1>
          
          <div className="blog-post-info">
            <div className="blog-author">
              <User size={16} />
              <span>{blog.user?.username || blog.author || 'Anonymous'}</span>
            </div>
          </div>
        </header>

        <div className="blog-post-content">
          <div className="content-text">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="blog-post-tags">
            <h4>Tags</h4>
            <div className="tags-list">
              {blog.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
