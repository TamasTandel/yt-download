# YouTube Video Downloader Frontend

A React-based frontend application for downloading YouTube videos with a modern, user-friendly interface.

## Features

- Clean and intuitive user interface
- Video quality selection
- Download progress tracking
- Video preview functionality
- Responsive design for all devices
- Dark/Light theme support

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

## Installation

### Local Development

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t youtube-downloader-frontend .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:80 youtube-downloader-frontend
   ```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_NODE_ENV=development
```

## Project Structure

```
frontend/
├── public/          # Static files
├── src/             # Source files
│   ├── components/  # React components
│   ├── pages/       # Page components
│   ├── styles/      # CSS/SCSS files
│   ├── utils/       # Utility functions
│   ├── App.js       # Main App component
│   └── index.js     # Entry point
├── package.json     # Dependencies and scripts
└── Dockerfile       # Docker configuration
```

## Available Scripts

- `npm start`: Run development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

## Docker Deployment

1. Build the image:
   ```bash
   docker build -t your-username/youtube-downloader-frontend .
   ```

2. Push to Docker Hub:
   ```bash
   docker push your-username/youtube-downloader-frontend
   ```

3. Pull and run on another machine:
   ```bash
   docker pull your-username/youtube-downloader-frontend
   docker run -p 3000:80 your-username/youtube-downloader-frontend
   ```

## Usage Guide

1. **Enter Video URL**
   - Paste a YouTube video URL in the input field
   - Click "Analyze" to fetch video information

2. **Select Quality**
   - Choose desired video quality from available options
   - View estimated file size and format details

3. **Download**
   - Click "Download" to start the process
   - Monitor progress in the progress bar
   - Access downloaded file when complete

## Development

### Code Style

- Follow React best practices
- Use functional components and hooks
- Implement proper error handling
- Maintain responsive design principles

### Testing

Run the test suite:
```bash
npm test
```

## Troubleshooting

Common issues and solutions:

1. **API Connection Issues**
   - Verify backend server is running
   - Check API URL in environment variables
   - Ensure CORS is properly configured

2. **Build Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Update Node.js version

3. **Docker Issues**
   - Ensure ports are not in use
   - Check Docker daemon is running
   - Verify network connectivity

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
