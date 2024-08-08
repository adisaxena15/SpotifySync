import React from 'react';
import { motion } from 'framer-motion';
import {Link} from 'react-router-dom'
const LogoEffect = ({color, link, text}) => {
  return (
    <div className="logo-text-container">
  <motion.div
    initial="initial"
    whileHover="hover"
    transition={{ duration: 0.3 }}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible' }}
  >
    <motion.span
      variants={{
        initial: { y: 0, scale: 1 },
        hover: { y: -100, scale: 0.5}}}
      style={{ color }}
      transition={{ duration: 0.3 }}>
      {text}
    </motion.span>
<Link to={text==="Spotify"?'https://open.spotify.com/':'https://www.youtube.com/'}>
    <motion.img
      src={link}
      alt="App-logo"
      className="logo-img"
      variants={{
        initial: { y: 50, scale: 0.5},
        hover: { y: -80, scale: 1}}}
      style={{opacity: 1}}
      transition={{ duration: 0.3 }}
    />
</Link>
  </motion.div>
</div>

  );
};

export default LogoEffect;
