import React, { useState } from 'react';

function VideoDetails({ video }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);

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
        <a
          href={f.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: '15px', color: '#007bff' }}
        >
          Download
        </a>
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
    </div>
  );
}

export default VideoDetails;
