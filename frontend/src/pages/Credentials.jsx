/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react'
import axios from 'axios'
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';
export default function Credentials() {
const [creds, setCreds] = useState({});
const [showModal, setShowModal] = useState(true);
const [checker, setChecker] = useState({
  ytChecker:"",
  spotifyChecker: "",
  error: true,
  message:"",
})
useEffect(()=>{
    const fetchData = async()=>{
    try{
        const response = await axios.get('/api/spotify_after_callback')
        setCreds(response.data)
        setChecker((prev)=>({...prev, ytChecker: response.data?.credentials?.client_id, spotifyChecker: response.data?.spotify_credentials?.expires_in}));
        if ( response.data?.credentials?.client_id && response.data?.spotify_credentials?.expires_in) {
          setChecker((prev)=>({...prev,error:false,message:"Both Have Been Logged in Successfully"}))
        } else if (! response.data?.credentials?.client_id && response.data?.spotify_credentials?.expires_in) {
          setChecker((prev)=>({...prev,error:true,message:"Only Spotify has been Logged in"}))
        } else if ( response.data?.credentials?.client_id && !response.data?.spotify_credentials?.expires_in) {
          setChecker((prev)=>({...prev,error:true,message:"Only Youtube has been Logged in"}))
        } else {
          setChecker((prev)=>({...prev,error:true,message:"Neither have been Logged in"}))
        }
     }catch(error){
      setChecker((prev)=>({...prev, error: true, message: "Backend is Not Running"}))
        console.log("Error catching data: ", error)
    }
    
}
fetchData();
},[])
  return (
    <>
      <pre>{JSON.stringify(creds, null, 2)}</pre>
      <div className="p-11 flex"><Link to=".." path="relative" className="text-xl button-container">Go Back</Link></div>
      <Modal message={checker.message} isVisible={showModal} onClose={()=>{setShowModal(false)}} error={checker.error}/>
    </>
  )
}
