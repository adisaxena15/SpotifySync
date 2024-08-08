/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom';
import { Link } from 'react-router-dom';
import qs from 'qs'
import axios from 'axios';
import {motion, AnimatePresence} from 'framer-motion'
import SendButton from '../components/SendButton';
import Modal from '../components/Modal';
import '../styles/songList.css'
export default function SongList() {
  const [songTitles, setSongTitles ] = useState([]);
  const [songsList, setSongsList] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccessFull, setIsSuccessFull] = useState(false);
  const [message, setMessage] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const location = useLocation();
  const {spotifyUrl, youtubeUrl} = location.state
  const Urls = {spotify_url: spotifyUrl, youtube_url:youtubeUrl}

  const spotify_playlist_id = get_playlist_id(spotifyUrl)

  function get_playlist_id(url){
    const parsedUrl = new URL(url); 
    const path = parsedUrl.pathname; 
    const pathSegments = path.split('/'); 
    const playlistId = pathSegments[2];
    return playlistId;
  }

  useEffect(()=>{
    const sendUrls = async()=>{
    try{
      const response = await axios.post('/api/sync_songs?return_json=true',qs.stringify(Urls), {
        headers:{'Content-Type': 'application/x-www-form-urlencoded',},
      })
      setSongTitles(response.data.song_titles);
      setSongsList(response.data.new_spotify_ids);
    }catch(error){console.error("error sending URLs: ", error);}
  }
  sendUrls();
  },[])
  
  async function AddSongs(){
    setIsDisabled(true);
    try{
      const response = await axios.post('/api/add_songs_in_spotify_playlist', {
        songs_list: songsList,
        spotify_playlist: spotify_playlist_id
      })
      setMessage(response.data.message)
    } catch(error){
      console.error('Error:', error.response ? error.response.data.error : error.message);
    }
  }

  const filteredSongTitles = songTitles.filter(title => 
    !title.toLowerCase().includes("deleted") && !title.toLowerCase().includes("private")
  );
  useEffect(() => {
    if (filteredSongTitles && filteredSongTitles.length > 0) {
      setIsOpen(true);
    }
  }, [filteredSongTitles])
  
  const ulVariants = {
    open:{
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    closed: {
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.2,
        when: "afterChildren",
      },
    },
  }
  const liVariants={
    open: { opacity: 1, scale: 1, filter: "blur(0px)" },
    closed: { opacity: 0, scale: 1, filter: "blur(3px)" },
  }
  useEffect(()=>{if(message==="Songs Added SuccessFully") setIsSuccessFull(true);},[message])
  return (
    <> 
    <h1 className="mt-20 text-2xl md:text-5xl uppercase font-bold text-center">Here are the songs that you wish to add</h1>
    {!isOpen && <div className="loading">
        <div className="loading-text">
            <span className="loading-text-words">L</span>
            <span className="loading-text-words">O</span>
            <span className="loading-text-words">A</span>
            <span className="loading-text-words">D</span>
            <span className="loading-text-words">I</span>
            <span className="loading-text-words">N</span>
            <span className="loading-text-words">G</span>
        </div>
    </div>}
    <AnimatePresence>
    {isOpen && <><motion.div className="song-list-container" initial="closed" animate={isOpen ? "open" : "closed"}>
        <motion.ul variants={ulVariants} className='song-list'>
          {filteredSongTitles && filteredSongTitles.map((id) => (
            <motion.li variants={liVariants} key={id} className="song-item">{id}</motion.li>
          ))}
        </motion.ul>
      </motion.div><div className="text-center text-3xl uppercase mt-8" style={{ color: isSuccessFull ? "green" : "red" }}>
        {message}
        </div>
        <div className="my-10 flex justify-center items-center gap-12">
          <Link to="/"><div> <SendButton text="Back" /></div></Link>
          {filteredSongTitles && <div onClick={AddSongs}> <SendButton text="Upload Songs" disabled={isDisabled}/></div>}
        </div></>}
      </AnimatePresence>
      <Modal message={message} isVisible={showModal && isSuccessFull} onClose={()=>{setShowModal(false)}} error={isSuccessFull?false:true}/>
    </>
  )
}
