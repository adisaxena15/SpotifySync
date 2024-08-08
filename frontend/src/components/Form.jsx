import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Form({triggerModal, isLogged}) {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  /* const [useAI, SetUseAI] = useState(false); */
  const isValidYoutubeUrl = youtubeUrl && youtubeUrl.includes('/playlist?list=');
  const isValidSpotifyUrl = spotifyUrl && spotifyUrl.startsWith('https://open.spotify.com/playlist');
  let canSubmit = isValidYoutubeUrl && isValidSpotifyUrl;

  const handleCheckboxChange = (event) => {
    /* SetUseAI(event.target.checked); */
  };
  function handleTriggerModal(){
    if(isLogged) triggerModal("You need to enter valid links", true)
    else triggerModal("You need to be logged in first", true)
  }
  return (
    <div className="flex justify-center items-center page">
      <div className="box md:w-auto border-white border-2 text-white px-10 py-16 rounded-lg shadow-lg flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-bold mb-2 text-center pb-4 uppercase">
          Enter Your Links
        </h1>
        <h1 className="text-2xl md:text-3xl font-bold text-green-600 mb-6">
          Your Spotify playlist you want to add your songs to:
        </h1>

        <motion.input
          required
          type="text"
          placeholder="Spotify Playlist URL"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          className="neon h-12 px-6"
          initial={{ boxShadow: 'none' }}
          whileFocus={{
            boxShadow: [
              '0 0 20px #0e5226, 0 0 30px #0e5226, 0 0 40px #0e5226, 0 0 50px #0e5226',
              '0 0 10px #0e5226, 0 0 30px #0e5226, 0 0 50px #0e5226, 0 0 70px #0e5226',
              '0 0 15px #0e5226, 0 0 25px #0e5226, 0 0 35px #0e5226, 0 0 55px #0e5226',
              '0 0 30px #0e5226, 0 0 40px #0e5226, 0 0 60px #0e5226, 0 0 80px #0e5226',
            ],
            transition: { duration: 2.5, repeat: Infinity, repeatType: 'mirror' }
          }}
          exit={{
            boxShadow: 'none',
            transition: { duration: 0.5 }
          }}
        />
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-6">
          The YouTube playlist to import:
        </h1>

        <motion.input
          required
          type="text"
          placeholder="YouTube Playlist URL"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="neon h-12 px-6"
          initial={{ boxShadow: 'none' }}
          whileFocus={{
            boxShadow: [
              '0 0 20px rgba(255, 0, 0, 0.521), 0 0 30px rgba(255, 0, 0, 0.521), 0 0 40px rgba(255, 0, 0, 0.521), 0 0 50px rgba(255, 0, 0, 0.521)',
              '0 0 10px rgba(255, 0, 0, 0.521), 0 0 30px rgba(255, 0, 0, 0.521), 0 0 50px rgba(255, 0, 0, 0.521), 0 0 70px rgba(255, 0, 0, 0.521)',
              '0 0 15px rgba(255, 0, 0, 0.521), 0 0 25px rgba(255, 0, 0, 0.521), 0 0 35px rgba(255, 0, 0, 0.521), 0 0 55px rgba(255, 0, 0, 0.521)',
              '0 0 30px rgba(255, 0, 0, 0.521), 0 0 40px rgba(255, 0, 0, 0.521), 0 0 60px rgba(255, 0, 0, 0.521), 0 0 80px rgba(255, 0, 0, 0.521)',
            ],
            transition: { duration: 2.5, repeat: Infinity, repeatType: 'mirror' }
          }}
          exit={{
            boxShadow: 'none',
            transition: { duration: 0.5 }
          }}
        />
         <div>
        <input
          type="checkbox"
          className="p-2 mr-2"
          checked={canSubmit}
          onChange={handleCheckboxChange}
        />
        Use AI to get songs
      </div>
          
        {canSubmit ? (
        <Link to='/form_submission' state={{ youtubeUrl, spotifyUrl }} style={{display: "flex"}}>
          <button className="text-2xl button-container">
            Submit
          </button>
        </Link>
        ) : (
          <button className="text-2xl button-container" onClick={handleTriggerModal}>
            Submit
          </button>
          )}
      </div>
    </div>
  );
}
