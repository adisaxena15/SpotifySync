import React, {useEffect} from 'react';
import {motion} from 'framer-motion'
export default function Modal({ message, isVisible, onClose, error }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;


const modalVariants = {
    hidden: {
      y: "100vh", 
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 13,
      }
    },
    exit: {
      y: "100vh", 
      opacity: 0,
      transition: {
        transition: {
          type: 'spring',
          stiffness: 100, 
          damping: 20,   
          mass: 0.75, 
        }
      }
    }
  };

  return (
    <motion.div className={`modal ${!error?'shadow-custom-green':'shadow-custom-red'}`}
    initial="hidden"
    animate={isVisible?"visible":"hidden"}
    variants={modalVariants}
    whileHover={{ scale: 1.01}}
    exit="exit"
    >
      {message}
      <button onClick={onClose} className="ml-4 bg-transparent border-none text-white cursor-pointer">
      X
      </button>
    </motion.div>
  );
}