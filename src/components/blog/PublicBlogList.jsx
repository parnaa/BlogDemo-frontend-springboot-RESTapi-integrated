import React from 'react';
import { useNavigate } from 'react-router-dom';
import BlogList from '../blog/BlogList';

const PublicBlogList = () => {
  const navigate = useNavigate();

  const handleBlogClick = (blogId) => {
    navigate(`/public-blog/${blogId}`);
  };

  return (
    <div>
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2>Public Blogs</h2>
            <p>Browse all public blog posts</p>
          </div>
          <BlogList isPublic={true} onBlogClick={handleBlogClick} />
        </div>
      </div>
    </div>
  );
};

export default PublicBlogList;
