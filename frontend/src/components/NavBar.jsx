/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useRef} from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import {motion, useScroll, useMotionValueEvent, AnimatePresence} from 'framer-motion'
import axios from 'axios';

export default function Navbar({scrollTo, triggerModal, setLoggedIn}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const {scrollY} = useScroll();
  const [ytCredentials, setYTCredentials] = useState('');
  const [spotifyCredentials, setSpotifyCredentials] = useState('');

 useMotionValueEvent(scrollY, "change", (latest)=>{
    const previous = scrollY.getPrevious();
    if(latest>previous && latest>600){
      setHidden(true)
    }
    else if(latest<1500){
      setHidden(false)
    }
  })
  const ulVariants = {
    open:{
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    closed: {
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.5,
        when: "afterChildren",
      },
    },
  }
  const liVariants={
    open: { opacity: 1, scale: 1, filter: "blur(0px)" },
    closed: { opacity: 0, scale: 0.3, filter: "blur(20px)" },
  }

  function handleScroll(){
    scrollTo();
  }

  const handleYoutubeLogin = async()=>{
    try{
      const response = await axios.get('/api/authorize?return_json=true');
      const { authorization_url } = response.data;
      window.location.href = authorization_url;
      triggerModal("Youtube Logged In Successfully", false)
    }catch (error) {
      console.error('Error fetching authorization URL:', error);
    }
  }

  const handleSpotifyLogin = async()=>{
    try{
      const response = await axios.get('/api/spotify_authorize?return_json=true');
      const {authorize_url} = response.data;
      window.location.href = authorize_url;
      }catch(error){
        console.error('Error Fetching spotify authorization: ', error)
      }
  }

useEffect(()=>{
  const fetchData = async() =>{
    const response = await axios.get('/api/spotify_after_callback');
      setYTCredentials(response.data?.credentials?.client_id);
      setSpotifyCredentials(response.data?.spotify_credentials?.access_token)
      if (response.data?.credentials?.client_id && response.data?.spotify_credentials?.access_token) {
        setIsLogged(true);
        setLoggedIn(true);
      }
  }
  fetchData();
},[])
const handleClear = async()=>{
  const response = await axios.get('/api/clear');
  window.location.reload();
}

if(ytCredentials && !spotifyCredentials){
  handleSpotifyLogin();
}
const handleLogin = async()=>{
  if(!ytCredentials) await handleYoutubeLogin();
}
  return (
    <>
    <motion.nav 
    variants={{
      visible:{y:0},
      hidden:{y: "-100%"}
    }}
    animate={hidden?"hidden":"visible"}
    transition={{duration: 0.5, ease:"easeInOut"}}
    className="nav-container">
      <div className="min-w-full container flex justify-around items-center">
        <div className="flex items-center space-x-4">
             <h1 className="text-3xl font-bold font-noir uppercase text-white">SpotifySync</h1>
        </div>
                <button className="md:hidden p-4 mr-0">
                    <label className="bar" htmlFor="check" >
                      <input type="checkbox" className="custom-checkbox" id="check" onClick={()=>{setIsOpen(!isOpen)}}/>
                      <span className="top"></span>
                      <span className="middle"></span>
                      <span className="bottom"></span>
                    </label>
                </button>
          
          <div className="text-2xl justify-evenly gap-7 p-5 font-noir hidden md:flex"> 
            <button onClick={handleYoutubeLogin} className="hover:text-gray-300 test">Youtube Login</button>
            <button onClick={handleSpotifyLogin} className="hover:text-gray-300 test">Spotify Login</button>        
            <Link to='/credentials'className="hover:text-gray-300 test whitespace-nowrap">View Credentials</Link>
            <button onClick={handleScroll} className="hover:text-gray-300 test">Enter Links</button>
          </div>

          <button onClick={isLogged?handleClear: handleLogin} className="md:block hidden">
            <div className="text-3xl button-container">{isLogged?"Logout":"Login"}</div>
          </button>
      </div>
    </motion.nav>

    <AnimatePresence>
      {isOpen && 
      <motion.div variants={{
        visible:{y:0},
        hidden:{y: "-200%"}
        }}
        animate={hidden?"hidden":"visible"}
        transition={{duration: 0.5, ease:"easeInOut"}} className="sticky top-40" >

        <motion.div className="dropdown text-lg" initial="closed" animate={isOpen?"open":"closed"}>
          <motion.ul className="list" variants={ulVariants}>
            <motion.li variants={liVariants}><button onClick={handleYoutubeLogin} className="hover:text-gray-300">Youtube Login</button></motion.li>
            <motion.li variants={liVariants}><button onClick={handleSpotifyLogin} className="hover:text-gray-300">Spotify Login</button></motion.li>
            <motion.li variants={liVariants}><Link to="/credentials" className="hover:text-gray-300">View Credentials</Link></motion.li>
            <motion.li variants={liVariants}><button onClick={handleScroll} className="hover:text-gray-300">Enter Links</button></motion.li>
            <motion.li variants={liVariants}><button onClick={isLogged?handleClear: handleLogin} className="hover:text-gray-300">{isLogged?"Logout":"Login"}</button></motion.li>
          </motion.ul>
        </motion.div>
        
        </motion.div>}
    </AnimatePresence>
    </>
  );
};

