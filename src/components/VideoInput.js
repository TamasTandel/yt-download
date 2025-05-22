import React, { useState } from 'react';
import axios from 'axios';

function VideoInput({ setVideoData }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('https://yt-downloader-backen.onrender.com/api/video-info', { url });
      setVideoData(res.data);
    } catch (err) {
      console.error('Error fetching video info:', err);
      setError('Failed to fetch video info. Please check the URL or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube URL"
        style={{ padding: '10px', width: '300px', marginRight: '10px' }}
      />
      <button type="submit" disabled={loading} style={{ padding: '10px 15px' }}>
        {loading ? 'Fetching...' : 'Fetch Video'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </form>
  );
}

export default VideoInput;
