import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ImageModal.css';

const ImageModal = ({ image, onClose }) => {
  const [description, setDescription] = useState('');
  const [ecoAlternative, setEcoAlternative] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const analysisRequested = useRef(false);

  useEffect(() => {
    const analyzeImage = async () => {
      // Check if analysis has already been requested for this image
      if (analysisRequested.current) return;
      analysisRequested.current = true;

      setLoading(true);
      setError(null);
      try {
        const response = await axios.post('http://127.0.0.1:5000/analyze', {
          image_url: image.src.original
        }, {
          timeout: 30000 // 30 second timeout
        });

        if (response.data) {
          // Format the description text
          const formattedDescription = formatAIResponse(response.data.description);
          const formattedEcoAlternative = formatAIResponse(response.data.eco_friendly_alternatives);
          
          setDescription(formattedDescription);
          setEcoAlternative(formattedEcoAlternative);
        }
      } catch (error) {
        console.error('Error analyzing image:', error);
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          setError('Could not connect to image analysis server. Please make sure the Flask server is running.');
        } else {
          setError('Failed to analyze image. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (image?.src?.original) {
      analyzeImage();
    }

    // Cleanup function to reset the flag when modal is closed
    return () => {
      analysisRequested.current = false;
    };
  }, [image]);

  // Function to format AI response with proper HTML
  const formatAIResponse = (text) => {
    if (!text) return "No information available.";

    // Convert markdown-style formatting to HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n\n/g, '</p><p>') // Paragraphs
      .replace(/\n/g, '<br/>'); // Line breaks

    // Handle bullet points
    if (formatted.includes('- ')) {
      formatted = formatted.split('\n').map(line => {
        if (line.trim().startsWith('- ')) {
          return `<li>${line.substring(2)}</li>`;
        }
        return line;
      }).join('');

      if (formatted.includes('<li>')) {
        formatted = `<ul>${formatted}</ul>`;
      }
    }

    return formatted;
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="image-modal" onClick={(e) => e.target.className === 'image-modal' && onClose()}>
      <span className="close-modal" onClick={onClose}>&times;</span>
      <div className="modal-content">
        <div className="modal-image-container">
          <img src={image.src.original} alt={image.alt || 'Selected image'} />
        </div>
        <div className="modal-info">
          <div className="info-section">
            <h3>Image Description</h3>
            <div className="description-container">
              {loading ? (
                <>
                  <div className="description-spinner"></div>
                  <p>Analyzing image with AI...</p>
                </>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : (
                <div 
                  className="ai-content"
                  dangerouslySetInnerHTML={{ __html: `<p>${description}</p>` }} 
                />
              )}
            </div>
          </div>

          <div className="info-section">
            <h3>Eco-Friendly Alternatives</h3>
            <div className="eco-container">
              {loading ? (
                <>
                  <div className="description-spinner"></div>
                  <p>Generating eco-friendly suggestions...</p>
                </>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : (
                <div 
                  className="ai-content"
                  dangerouslySetInnerHTML={{ __html: `<p>${ecoAlternative}</p>` }} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 