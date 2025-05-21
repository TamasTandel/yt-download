// File: src/components/VideoInput.js
import React, { useState } from 'react';
import axios from 'axios';

function VideoInput({ setVideoData }) {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://yt-downloader-backen.onrender.com/api/video-info', { url });
      setVideoData(res.data);
    } catch (err) {
      console.error('Error fetching video info:', err);
      alert('Failed to fetch video info. Check the console for details.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube URL"
      />
      <button type="submit">Fetch Video</button>
    </form>
  );
}

export default VideoInput;
