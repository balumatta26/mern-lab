import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    userId: 1
  });
  const [editMode, setEditMode] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'form'
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Fetch all posts
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Create a new post
  const createPost = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      const data = await response.json();
      
      // Add the new post to our state with the ID from the response
      const newPost = { ...data };
      setPosts([newPost, ...posts]);
      resetForm();
      setViewMode('list');
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Update a post
  const updatePost = async (e) => {
    e.preventDefault();
    try {
      // For JSONPlaceholder: check if post ID is greater than 100
      // These are likely posts we created during this session and don't really exist on the server
      const isNewlyCreatedPost = currentPostId > 100;
      
      if (isNewlyCreatedPost) {
        // Just update it in our local state without server request
        const updatedPosts = posts.map(post => 
          post.id === currentPostId ? { ...post, ...formData } : post
        );
        setPosts(updatedPosts);
        resetForm();
        setViewMode('list');
        return;
      }
      
      // For existing posts (IDs 1-100), send a real request
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${currentPostId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      
      const data = await response.json();
      const updatedPosts = posts.map(post => 
        post.id === currentPostId ? { ...data, id: post.id } : post
      );
      
      setPosts(updatedPosts);
      resetForm();
      setViewMode('list');
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Delete a post
  const deletePost = async (id) => {
    try {
      // For JSONPlaceholder: check if post ID is greater than 100
      const isNewlyCreatedPost = id > 100;
      
      if (!isNewlyCreatedPost) {
        // For existing posts, send a real delete request
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete post');
        }
      }
      
      // Update our local state regardless
      const filteredPosts = posts.filter(post => post.id !== id);
      setPosts(filteredPosts);
      
      if (viewMode === 'detail' && selectedPost && selectedPost.id === id) {
        setViewMode('list');
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Set form to edit mode with data
  const handleEditClick = (post) => {
    setFormData({
      title: post.title,
      body: post.body,
      userId: post.userId || 1
    });
    setCurrentPostId(post.id);
    setEditMode(true);
    setViewMode('form');
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      userId: 1
    });
    setEditMode(false);
    setCurrentPostId(null);
  };
  
  // View post details
  const viewPostDetails = (post) => {
    setSelectedPost(post);
    setViewMode('detail');
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    if (editMode) {
      updatePost(e);
    } else {
      createPost(e);
    }
  };
  
  // Rendering based on view mode
  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading posts...</div>;
    }
    
    if (error) {
      return <div className="error">Error: {error}</div>;
    }
    
    if (viewMode === 'form') {
      return (
        <div className="form-container">
          <h2>{editMode ? 'Edit Post' : 'Create New Post'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="body">Content</label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleChange}
                required
                rows="6"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editMode ? 'Update Post' : 'Create Post'}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  resetForm();
                  setViewMode('list');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      );
    }
    
    if (viewMode === 'detail' && selectedPost) {
      return (
        <div className="post-detail">
          <button className="btn-back" onClick={() => setViewMode('list')}>
            &larr; Back to Posts
          </button>
          <h2>{selectedPost.title}</h2>
          <p className="post-body">{selectedPost.body}</p>
          <div className="post-actions">
            <button 
              className="btn-edit" 
              onClick={() => handleEditClick(selectedPost)}
            >
              Edit
            </button>
            <button 
              className="btn-delete" 
              onClick={() => deletePost(selectedPost.id)}
            >
              Delete
            </button>
          </div>
        </div>
      );
    }
    
    // Default: list view
    return (
      <div className="posts-container">
        <h2>Posts</h2>
        <button 
          className="btn-add" 
          onClick={() => {
            resetForm();
            setViewMode('form');
          }}
        >
          + Add New Post
        </button>
        
        {posts.length === 0 ? (
          <p className="no-posts">No posts found. Create one!</p>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <h3 onClick={() => viewPostDetails(post)}>{post.title}</h3>
                <p>{post.body.substring(0, 100)}...</p>
                <div className="card-actions">
                  <button 
                    className="btn-view"
                    onClick={() => viewPostDetails(post)}
                  >
                    View
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditClick(post)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => deletePost(post.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="app">
      <header>
        <h1>JSONPlaceholder CRUD App</h1>
      </header>
      <main>
        {renderContent()}
      </main>
      <footer>
        <p>&copy; 2025 CRUD Application</p>
      </footer>
    </div>
  );
}

export default App;