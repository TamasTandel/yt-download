import React, { useState } from 'react';
import axios from 'axios';

function VideoDetails({ video }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [merging, setMerging] = useState(false);
  const [mergeStatus, setMergeStatus] = useState('');
  const [error, setError] = useState('');

  const handleMerge = async () => {
    if (!selectedVideo || !selectedAudio) {
      alert('Please select both video and audio formats.');
      return;
    }

    setMerging(true);
    setMergeStatus('Merging video and audio... Please wait (approx. 10–30 seconds)');
    setError('');

    try {
      const res = await axios.post('https://yt-downloader-backen.onrender.com/api/merge', {
        videoUrl: selectedVideo.url,
        audioUrl: selectedAudio.url,
      });
      const downloadUrl = res.data.downloadUrl;
      setMergeStatus('Merge complete! Downloading...');
      window.location.href = downloadUrl;
    } catch (err) {
      console.error('Error merging video and audio:', err);
      setError('Failed to merge video and audio. Please try again.');
    } finally {
      setMerging(false);
    }
  };

  const renderDownloadLinks = (formats, labelFn, selectedFn, setSelectedFn) =>
    formats?.map((f) => (
      <div key={f.format_id} style={{ marginBottom: '10px' }}>
        <input
          type="radio"
          name={labelFn.name}
          checked={selectedFn?.url === f.url}
          onChange={() => setSelectedFn(f)}
        />
        <label style={{ marginLeft: '8px' }}>
          {labelFn(f)} — {f.filesize ? (f.filesize / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown size'}
        </label>
      </div>
    ));

  return (
    <div style={{ marginTop: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>{video.title}</h2>
      <img src={video.thumbnail} alt="Thumbnail" style={{ width: '320px', borderRadius: '10px' }} />

      <h3>Video Only Formats:</h3>
      {renderDownloadLinks(video.video_only_formats, (f) => `Video Only ${f.resolution}`, selectedVideo, setSelectedVideo)}

      <h3>Audio Only Formats:</h3>
      {renderDownloadLinks(video.audio_only_formats, (f) => `Audio Only ${f.abr}kbps`, selectedAudio, setSelectedAudio)}

      <button
        onClick={handleMerge}
        disabled={merging}
        style={{
          marginTop: '20px',
          padding: '10px 15px',
          backgroundColor: merging ? '#6c757d' : '#28a745',
          color: '#fff',
          borderRadius: '5px',
          fontWeight: 'bold',
          cursor: merging ? 'not-allowed' : 'pointer',
        }}
      >
        {merging ? 'Merging...' : 'Merge and Download'}
      </button>

      {mergeStatus && <p style={{ marginTop: '10px', color: '#555' }}>{mergeStatus}</p>}
      {error && <p style={{ marginTop: '10px', color: 'red' }}>{error}</p>}
    </div>
  );
}

export default VideoDetails;
