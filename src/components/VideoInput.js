import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

function VideoInput({ setVideoData }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractVideoId = (url) => {
    try {
      console.log('Extracting video ID from:', url);
      
      // Remove any whitespace and check if URL is empty
      if (!url || !url.trim()) {
        console.log('Empty URL');
        return null;
      }

      // Try to create URL object to handle different formats
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch (e) {
        console.log('Invalid URL format, trying to add https://', e);
        try {
          urlObj = new URL('https://' + url);
        } catch (e2) {
          console.log('Still invalid URL after adding https://', e2);
          return null;
        }
      }

      console.log('Parsed URL:', urlObj.toString());

      // Handle youtu.be URLs
      if (urlObj.hostname === 'youtu.be') {
        const id = urlObj.pathname.split('/')[1];
        console.log('youtu.be format, extracted ID:', id);
        return id || null;
      }

      // Handle youtube.com URLs
      if (urlObj.hostname === 'youtube.com' || urlObj.hostname === 'www.youtube.com') {
        // Handle /watch?v= format
        const searchParams = new URLSearchParams(urlObj.search);
        const id = searchParams.get('v');
        if (id) {
          console.log('youtube.com format, extracted ID:', id);
          return id;
        }

        // Handle /shorts/ format
        if (urlObj.pathname.includes('/shorts/')) {
          const id = urlObj.pathname.split('/shorts/')[1];
          console.log('youtube shorts format, extracted ID:', id);
          return id || null;
        }

        // Handle /v/ format
        if (urlObj.pathname.includes('/v/')) {
          const id = urlObj.pathname.split('/v/')[1];
          console.log('youtube /v/ format, extracted ID:', id);
          return id || null;
        }
      }

      console.log('No video ID found in URL');
      return null;
    } catch (err) {
      console.error('Error extracting video ID:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        setError('Please enter a YouTube URL');
        return;
      }

      // Add https:// if not present
      let processedUrl = trimmedUrl;
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        processedUrl = 'https://' + trimmedUrl;
      }

      console.log('Processing URL:', processedUrl);
      const videoId = extractVideoId(processedUrl);
      
      if (!videoId) {
        setError('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)');
        return;
      }

      const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log('Fetching video info for:', { videoId, fullUrl });
      
      const response = await axios.post(`${API_BASE_URL}/api/video-info`, { 
        url: fullUrl
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setVideoData({
        ...response.data,
        videoId,
        url: fullUrl
      });
    } catch (err) {
      console.error('Error fetching video info:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message;
      setError(errorMessage || 'Failed to fetch video info. Please check the URL or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL"
            style={{ 
              padding: '10px', 
              width: '300px', 
              marginRight: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              padding: '10px 15px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Fetching...' : 'Fetch Video'}
          </button>
        </div>
        {error && (
          <div style={{ 
            color: '#dc3545', 
            backgroundColor: '#f8d7da',
            padding: '10px',
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <strong>Error:</strong> {error}
            <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
              Valid URL formats:
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
                <li>https://youtu.be/dQw4w9WgXcQ</li>
                <li>youtube.com/watch?v=dQw4w9WgXcQ</li>
              </ul>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default VideoInput;
