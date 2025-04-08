import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ImageModal from './ImageModal';
import './Home.css';

const Home = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Use your Pexels API key here
  const PEXELS_API_KEY = 'V8EJNn6TgYQ4h5hzM2Zg9hOW9TcguBd62nGGlYzIBX4UQuYX0bDgRJVl';

  const getRandomTopics = () => {
    const topics = ['nature', 'architecture', 'travel', 'technology', 'cars', 'cyberpunk', 
                    'minimalist', 'cityscape', 'dark', 'superhero', 'vintage', 'poster', 'art'];
    const shuffled = [...topics].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).join(',');
  };

  const fetchImages = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const query = searchQuery || getRandomTopics();
      const endpoint = searchQuery 
        ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&page=${page}&size=large`
        : `https://api.pexels.com/v1/curated?per_page=20&page=${page}`;

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      });
      
      if (response.data.photos) {
        // Transform the photos to use higher quality images
        const highQualityPhotos = response.data.photos.map(photo => ({
          ...photo,
          src: {
            ...photo.src,
            medium: photo.src.large2x || photo.src.large || photo.src.medium,
            original: photo.src.original || photo.src.large2x || photo.src.large
          }
        }));

        // If it's a new search, replace images. Otherwise, append them.
        setImages(prevImages => page === 1 ? highQualityPhotos : [...prevImages, ...highQualityPhotos]);
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images. Please try again later.');
      if (page === 1) {
        setImages(generatePlaceholderImages());
      }
    }
    setLoading(false);
  };

  const generatePlaceholderImages = () => {
    const placeholders = [];
    const aspectRatios = [
      {width: 800, height: 1200}, // Higher resolution placeholders
      {width: 1200, height: 800},
      {width: 1000, height: 1000},
      {width: 800, height: 1600},
      {width: 1600, height: 800}
    ];
    
    for (let i = 1; i <= 20; i++) {
      const ratio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      
      placeholders.push({
        id: i,
        src: {
          original: `https://via.placeholder.com/${ratio.width}x${ratio.height}/${randomColor}/FFFFFF`,
          medium: `https://via.placeholder.com/${ratio.width}x${ratio.height}/${randomColor}/FFFFFF`
        },
        height: ratio.height,
        width: ratio.width
      });
    }
    return placeholders;
  };

  // Effect for handling search queries from navigation state
  useEffect(() => {
    const searchQuery = location.state?.searchQuery;
    if (searchQuery) {
      setPage(1); // Reset page number for new search
      setImages([]); // Clear existing images
      fetchImages(searchQuery);
      // Clear the search query from location state
      window.history.replaceState({}, document.title);
    } else if (images.length === 0) {
      fetchImages();
    }
  }, [location.state?.searchQuery]);

  const handleLoadMore = () => {
    const searchQuery = location.state?.searchQuery;
    fetchImages(searchQuery);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <div className="main-body">
      <h2 id="date">{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</h2>
      <h1>
        {location.state?.searchQuery 
          ? `Results for "${location.state.searchQuery}"`
          : 'Stay Inspired'}
      </h1>
      {error && <div className="error-message">{error}</div>}
      <div className="masonry-grid">
        {images.map((image, index) => (
          <div key={`${image.id}-${index}`} className="masonry-item" onClick={() => handleImageClick(image)}>
            <img 
              src={image.src.medium} 
              alt={image.alt || 'Explore image'} 
              loading="lazy"
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>
        ))}
      </div>
      {loading && <div className="spinner"></div>}
      <button className="load-more" onClick={handleLoadMore} disabled={loading}>
        {loading ? 'Loading...' : 'Load More'}
      </button>
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default Home; 