import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

function VideoDetails({ video }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleMerge = async () => {
    if (!selectedVideo || !selectedAudio) {
      setError('Please select both video and audio formats');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Debug log to see the video object structure
      console.log('Video object:', video);

      // Extract video ID from the video URL if id is not directly available
      let videoId = video.id || video.video_id;
      if (!videoId && video.url) {
        try {
          const urlObj = new URL(video.url);
          videoId = urlObj.searchParams.get('v');
        } catch (e) {
          console.error('Error parsing video URL:', e);
        }
      }

      // If still no video ID, try to extract from full URL
      if (!videoId && video.fullUrl) {
        try {
          const urlObj = new URL(video.fullUrl);
          videoId = urlObj.searchParams.get('v');
        } catch (e) {
          console.error('Error parsing full URL:', e);
        }
      }

      console.log('Extracted video ID:', videoId);

      if (!videoId) {
        throw new Error('Video ID not found. Please try refreshing the page.');
      }

      // Get format IDs
      const videoFormatId = selectedVideo.format_id;
      const audioFormatId = selectedAudio.format_id;

      if (!videoFormatId || !audioFormatId) {
        throw new Error('Format IDs not found');
      }

      console.log('Starting merge with formats:', {
        video: {
          id: videoId,
          format_id: videoFormatId,
          resolution: selectedVideo.resolution,
          filesize: formatFileSize(selectedVideo.filesize)
        },
        audio: {
          format_id: audioFormatId,
          bitrate: selectedAudio.abr,
          filesize: formatFileSize(selectedAudio.filesize)
        }
      });

      // Create URLs with format IDs
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}&itag=${videoFormatId}`;
      const audioUrl = `https://www.youtube.com/watch?v=${videoId}&itag=${audioFormatId}`;

      const response = await fetch(`${API_BASE_URL}/api/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl, audioUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to merge video');
      }

      // Check if the response is JSON (error) or blob (video)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Server returned an error');
      }

      // Create a blob from the video stream
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Received empty file from server');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title || 'video'}_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setIsLoading(false);
      setSuccess(true);
    } catch (error) {
      console.error('Merge error:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) {
      return `${mb.toFixed(2)} MB`;
    }
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown duration';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderFormatCard = (format, type) => {
    const isVideo = type === 'video';
    const isSelected = isVideo ? selectedVideo?.format_id === format.format_id : selectedAudio?.format_id === format.format_id;
    
    // Calculate size in MB or GB
    const size = format.filesize ? formatFileSize(format.filesize) : 'Size unknown';
    const bitrate = format.tbr ? `${format.tbr.toFixed(0)} kbps` : '';
    
    return (
      <div 
        key={format.format_id} 
        style={{ 
          border: `2px solid ${isSelected ? '#007bff' : '#ddd'}`,
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '10px',
          backgroundColor: isSelected ? '#f8f9fa' : 'white',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              type="radio"
              name={type}
              checked={isSelected}
              onChange={() => isVideo ? setSelectedVideo(format) : setSelectedAudio(format)}
              style={{ marginRight: '10px' }}
            />
            <label>
              {isVideo ? (
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {format.resolution} 
                    {format.fps && format.fps !== 'N/A' && ` @ ${format.fps}fps`}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {format.vcodec && format.vcodec !== 'N/A' && `Codec: ${format.vcodec}`}
                    {bitrate && ` • Bitrate: ${bitrate}`}
                    {size && ` • Size: ${size}`}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {format.abr ? `${format.abr}kbps` : 'Unknown bitrate'}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {format.acodec && format.acodec !== 'N/A' && `Codec: ${format.acodec}`}
                    {format.format_note && ` • ${format.format_note}`}
                    {size && ` • Size: ${size}`}
                  </div>
                </div>
              )}
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href={format.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 15px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.9em',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Download</span>
              <span style={{ fontSize: '0.8em' }}>({size})</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Add a new component for showing total size information
  const TotalSizeInfo = () => {
    if (!selectedVideo || !selectedAudio) return null;

    const videoSize = selectedVideo.filesize || 0;
    const audioSize = selectedAudio.filesize || 0;
    const totalSize = videoSize + audioSize;

    return (
      <div style={{ 
        backgroundColor: '#e9ecef',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Selected Files Information</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Video Format:</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Resolution: {selectedVideo.resolution}</li>
              <li>Size: {formatFileSize(videoSize)}</li>
              <li>Bitrate: {selectedVideo.tbr ? `${selectedVideo.tbr.toFixed(0)} kbps` : 'N/A'}</li>
              <li>Codec: {selectedVideo.vcodec || 'N/A'}</li>
            </ul>
          </div>
          <div>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Audio Format:</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Quality: {selectedAudio.format_note || `${selectedAudio.abr}kbps`}</li>
              <li>Size: {formatFileSize(audioSize)}</li>
              <li>Codec: {selectedAudio.acodec || 'N/A'}</li>
            </ul>
          </div>
        </div>
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          borderRadius: '4px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Total Download Size: {formatFileSize(totalSize)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <img 
          src={video.thumbnail} 
          alt="Thumbnail" 
          style={{ width: '320px', borderRadius: '10px', objectFit: 'cover' }} 
        />
        <div>
          <h2 style={{ margin: '0 0 10px 0' }}>{video.title}</h2>
          <div style={{ 
            backgroundColor: '#e9ecef', 
            padding: '10px', 
            borderRadius: '8px',
            marginTop: '10px'
          }}>
            {video.duration && (
              <p style={{ margin: '5px 0' }}>
                Duration: {formatDuration(video.duration)}
              </p>
            )}
            {video.view_count && (
              <p style={{ margin: '5px 0' }}>
                Views: {video.view_count.toLocaleString()}
              </p>
            )}
            {video.filesize_approx && (
              <p style={{ margin: '5px 0' }}>
                Approximate Size: {formatFileSize(video.filesize_approx)}
              </p>
            )}
          </div>
          {(selectedVideo || selectedAudio) && (
            <div style={{ 
              backgroundColor: '#e9ecef', 
              padding: '10px', 
              borderRadius: '8px',
              marginTop: '10px'
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Selected Files:</h4>
              {selectedVideo && (
                <p style={{ margin: '5px 0' }}>
                  Video: {selectedVideo.resolution} ({formatFileSize(selectedVideo.filesize)})
                  {selectedVideo.tbr && ` - ${selectedVideo.tbr.toFixed(0)} kbps`}
                </p>
              )}
              {selectedAudio && (
                <p style={{ margin: '5px 0' }}>
                  Audio: {selectedAudio.abr}kbps ({formatFileSize(selectedAudio.filesize)})
                </p>
              )}
              {selectedVideo && selectedAudio && (
                <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>
                  Total Size: {formatFileSize((selectedVideo.filesize || 0) + (selectedAudio.filesize || 0))}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedVideo && selectedAudio && <TotalSizeInfo />}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>Video Formats</h3>
        {video.video_only_formats?.map(format => renderFormatCard(format, 'video'))}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>Audio Formats</h3>
        {video.audio_only_formats?.map(format => renderFormatCard(format, 'audio'))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleMerge}
          disabled={isLoading || !selectedVideo || !selectedAudio}
          style={{
            padding: '12px 24px',
            backgroundColor: !selectedVideo || !selectedAudio ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !selectedVideo || !selectedAudio ? 'not-allowed' : 'pointer',
            fontSize: '1.1em',
            transition: 'background-color 0.3s ease'
          }}
        >
          {isLoading ? 'Merging...' : 'Merge Selected Video and Audio'}
        </button>

        {success && (
          <p style={{ 
            color: '#28a745',
            marginTop: '10px',
            fontSize: '1.1em'
          }}>
            Merge successful! Your video is ready to download.
          </p>
        )}

        {error && (
          <p style={{ color: '#dc3545', marginTop: '10px' }}>{error}</p>
        )}
      </div>
    </div>
  );
}

export default VideoDetails;
