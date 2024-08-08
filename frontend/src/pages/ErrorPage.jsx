import React from 'react'
import {Link} from 'react-router-dom'
import Navbar from '../components/NavBar.jsx';
import SendButton from '../components/SendButton.jsx';
import { useRouteError } from 'react-router-dom';
export default function ErrorPage() {
  const error = useRouteError();
  let message = '';
  if (error.message ==="Cannot read properties of null (reading 'spotifyUrl')") message="You Have Not Logged In"
  else message="You Have Reached an Incorrect URL"
  return (
    <>
    <Navbar />
    <div className= "flex justify-center items-center flex-col gap-5 h-screen">
        <h1 className="text-5xl text-center">Sorry, something went wrong!!</h1>
        {error && (
        <div>
          <p className="text-red-600 text-lg">Error: {message}</p>
        </div>)}
        <h1 className="text-3xl">Kindly Try Again</h1>
        <Link to="/" >
            <SendButton text="Back" />
        </Link>
    </div>
    </>
  )
}
