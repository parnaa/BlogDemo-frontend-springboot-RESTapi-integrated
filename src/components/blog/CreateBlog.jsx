import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Send, 
  FileText, 
  Eye,
  X
} from 'lucide-react';

const CreateBlog = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Fetch blog data for editing
  useEffect(() => {
    if (isEditMode) {
      const fetchBlogForEdit = async () => {
        try {
          setLoading(true);
          console.log('📝 Fetching blog for edit, ID:', id);
          
          // Try public endpoint first (for viewing), then protected endpoint
          let blogData;
          try {
            console.log('🌐 Trying public endpoint first...');
            blogData = await blogAPI.getPublicBlogById(id);
            console.log('✅ Blog data fetched from public endpoint:', blogData);
          } catch (publicError) {
            console.log('❌ Public endpoint failed, trying protected endpoint...');
            blogData = await blogAPI.getBlogById(id);
            console.log('✅ Blog data fetched from protected endpoint:', blogData);
          }
          
          setFormData({
            title: blogData.title || '',
            content: blogData.content || ''
          });
        } catch (error) {
          console.error('❌ Error fetching blog for edit:', error);
          toast.error('Failed to load blog for editing');
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      
      fetchBlogForEdit();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Create blog data matching the API expected format
      const blogData = {
        title: formData.title,
        content: formData.content
      };
      
      if (isEditMode) {
        console.log('✏️ Updating blog with data:', blogData);
        const response = await blogAPI.updateBlog(id, blogData);
        toast.success('Blog updated successfully!');
      } else {
        console.log('📝 Creating blog with data:', blogData);
        const response = await blogAPI.createBlog(blogData);
        toast.success('Blog created successfully!');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} blog:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} blog`);
    } finally {
      setLoading(false);
    }
  };

  if (preview) {
    return (
      <div className="blog-preview">
        <div className="preview-header">
          <h2>Blog Preview</h2>
          <button 
            onClick={() => setPreview(false)}
            className="close-preview-btn"
          >
            <X size={20} />
            Close Preview
          </button>
        </div>
        
        <div className="preview-content">
          <article className="blog-article">
            <header className="blog-header">
              <h1>{formData.title}</h1>
              <div className="blog-meta">
                <span>By {user.username}</span>
              </div>
            </header>
            
            <div className="blog-content">
              {formData.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="create-blog-container">
      <div className="create-blog-header">
        <h1>
          <FileText size={28} />
          {isEditMode ? 'Edit Blog' : 'Create New Blog'}
        </h1>
        <div className="header-actions">
          <button 
            onClick={() => setPreview(true)}
            className="preview-btn"
          >
            <Eye size={20} />
            Preview
          </button>
        </div>
      </div>

      <form className="create-blog-form">
        <div className="form-group">
          <label htmlFor="title">Blog Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter your blog title..."
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
            disabled={loading}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="content">Blog Content</label>
          <textarea
            id="content"
            name="content"
            placeholder="Write your blog content here..."
            value={formData.content}
            onChange={handleChange}
            rows="15"
            className={errors.content ? 'error' : ''}
            disabled={loading}
          />
          {errors.content && <span className="error-message">{errors.content}</span>}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleSubmit}
            className="submit-btn"
            disabled={loading}
          >
            <Send size={20} />
            {loading 
              ? (isEditMode ? 'Updating...' : 'Creating...') 
              : (isEditMode ? 'Update Blog' : 'Create Blog')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
