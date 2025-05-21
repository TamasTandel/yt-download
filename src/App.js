import React, { useState } from 'react';
import VideoInput from './components/VideoInput';
import VideoDetails from './components/VideoDetails';

function App() {
  const [videoData, setVideoData] = useState(null);

  return (
    <div>
      <h1>YouTube Video Downloader</h1>
      <VideoInput setVideoData={setVideoData} />
      {videoData && <VideoDetails video={videoData} />}
    </div>
  );
}

export default App;
