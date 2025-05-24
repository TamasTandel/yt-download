import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

function VideoDetails({ video }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState('');
  const [mergeUrl, setMergeUrl] = useState('');
  const [mergedFileInfo, setMergedFileInfo] = useState(null);
  const [mergeStatus, setMergeStatus] = useState('');

  const handleMerge = async () => {
    if (!selectedVideo || !selectedAudio) {
      setMergeError('Please select both video and audio formats');
      return;
    }

    if (!selectedVideo.format_id || !selectedAudio.format_id) {
      setMergeError('Invalid format selection. Please try different formats.');
      return;
    }

    setMerging(true);
    setMergeError('');
    setMergeUrl('');
    setMergedFileInfo(null);
    setMergeStatus('Starting merge process...');

    try {
      // Get the base video URL
      const baseUrl = video.url;
      if (!baseUrl) {
        throw new Error('Video URL not found');
      }

      // Create URLs with format IDs
      const videoUrl = selectedVideo.url;
      const audioUrl = selectedAudio.url;

      if (!videoUrl || !audioUrl) {
        throw new Error('Format URLs not available');
      }

      console.log('Starting merge with formats:', {
        video: {
          format_id: selectedVideo.format_id,
          resolution: selectedVideo.resolution,
          filesize: formatFileSize(selectedVideo.filesize)
        },
        audio: {
          format_id: selectedAudio.format_id,
          bitrate: selectedAudio.abr,
          filesize: formatFileSize(selectedAudio.filesize)
        }
      });

      setMergeStatus('Downloading and merging files...');
      const response = await axios.post(`${API_BASE_URL}/api/merge`, {
        videoUrl: `${baseUrl}&itag=${selectedVideo.format_id}`,
        audioUrl: `${baseUrl}&itag=${selectedAudio.format_id}`
      });

      if (!response.data || !response.data.downloadUrl) {
        throw new Error('Invalid response from server');
      }

      setMergeUrl(response.data.downloadUrl);
      setMergedFileInfo({
        size: response.data.fileSizeMB,
        name: response.data.fileName
      });
      setMergeStatus('Merge completed successfully!');
    } catch (error) {
      console.error('Merge error:', error.response?.data || error);
      const errorMessage = error.response?.data?.details || error.message || 'Failed to merge video and audio. Please try again.';
      setMergeError(`Error: ${errorMessage}`);
      setMergeStatus('');
    } finally {
      setMerging(false);
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
          disabled={merging || !selectedVideo || !selectedAudio}
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
          {merging ? 'Merging...' : 'Merge Selected Video and Audio'}
        </button>

        {mergeStatus && (
          <p style={{ 
            color: mergeStatus.includes('error') ? '#dc3545' : '#28a745',
            marginTop: '10px',
            fontSize: '1.1em'
          }}>
            {mergeStatus}
          </p>
        )}

        {mergeError && (
          <p style={{ color: '#dc3545', marginTop: '10px' }}>{mergeError}</p>
        )}

        {mergeUrl && mergedFileInfo && (
          <div style={{ 
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #28a745'
          }}>
            <p style={{ color: '#28a745', marginBottom: '15px', fontSize: '1.1em' }}>
              Merge successful! Your video is ready to download.
            </p>
            <div style={{ 
              backgroundColor: '#e9ecef',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              display: 'inline-block'
            }}>
              <span style={{ fontWeight: 'bold' }}>Final File Size:</span> {mergedFileInfo.size} MB
            </div>
            <a
              href={mergeUrl}
              download={mergedFileInfo.name}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '1.1em',
                transition: 'background-color 0.3s ease'
              }}
            >
              Download Merged Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoDetails;
