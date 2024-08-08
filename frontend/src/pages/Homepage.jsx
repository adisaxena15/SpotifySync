import React, {useState, useRef} from 'react'
import "../styles/homepage.css"
import spotifyLogo from '../pictures/spotifyLogo.png';
import youtubeLogo from '../pictures/youtubeLogo.png'
import LogoEffect from '../components/LogoEffect';
import Navbar from '../components/NavBar.jsx';
import { HeroParallax } from '../components/HeroParallax.tsx';
import Form from '../components/Form.jsx';
import Modal from '../components/Modal.jsx';
import { gallery } from '../pictures/pictures.js';

export default function Homepage() {
  const targetRef = useRef(null);
  const [isLogged, setIsLogged] = useState(false);
  const [modal, setModal] = useState({
    showModal: false,
    message: '',
    error: false
  })
  const scrollTo = ()=>{
    if(targetRef.current){
      targetRef.current.scrollIntoView({behavior:'smooth', block:'start'})
    }
  }
  function triggerModal(message, error){
    setModal((prev)=>({
      ...prev, showModal: true, message: message, error: error
    }));
  }
  function setLoggedIn(isLoggedIn){
    setIsLogged(isLoggedIn)
  }
  return (
    <>
    <Navbar scrollTo={scrollTo} triggerModal={triggerModal} setLoggedIn={setLoggedIn}/>
    <div id="title-container">
        <h1 className="uppercase font-extrabold text-4xl leading-relaxed text-center md:text-7xl">Transfer your
            <LogoEffect color="#FF0000" link={youtubeLogo} text={"Youtube"}/> Playlists
            <span className="break">to
                <LogoEffect color="#1DB954" link={spotifyLogo} text={"Spotify"}/>
            </span></h1>
    </div>
    <HeroParallax gallery={gallery} />
    <Form triggerModal={triggerModal} isLogged={isLogged}/>
    <div style={{padding: "2rem"}} ref={targetRef}></div>
    <Modal message={modal.message} isVisible={modal.showModal} onClose={()=>setModal((prev)=>({...prev, showModal:false}))} error={modal.error}/>
    </>
  )
}
