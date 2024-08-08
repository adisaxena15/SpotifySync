# Spotify Sync

Spotify Sync is a web application designed to synchronize music playlists between Spotify and YouTube. This tool seamlessly transfers users' favorite music tracks from YouTube playlists into their Spotify playlists.

![image](https://github.com/user-attachments/assets/d929b128-8dd0-449c-8a00-995e16b80077)

## Features

- **OAuth2 Authentication**: Secure integration with Spotify and YouTube to access user playlists without losing data. 
- **Playlist Synchronization**: Users can select a YouTube playlist to sync, and the app will automatically add all available tracks to a specified Spotify playlist.
- **Responsive UI**: A clean and responsive interface for an optimal user experience across various devices and screen sizes.
- **Error Handling**: Comprehensive error handling to ensure users are informed of any issues during the sync process.

## Technologies Used

- **Frontend**: React.js, TailwindCSS, React Axios, Framer Motion, .
- **Backend**: Flask, Flask-CORS for handling cross-origin requests, Google API Client, Spotify Web API, ChatGPT API.
- **Authentication**: OAuth2.0 for secure access to Spotify and YouTube services.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What you need to install the software:

- Git
- Python 3
- Node.js and npm

### Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/adisaxena15/SpotifySync.git
   cd SpotifySync
    ```
2. **Getting Backend Started (Assuming you have pip installed)**
   
  ```sh
  cd backend
  pip install -r requirements.txt
  python main_app.py
```

3. **Getting Frontend Started**
  ```sh
  cd frontend
  npm install
  npm run start
```
