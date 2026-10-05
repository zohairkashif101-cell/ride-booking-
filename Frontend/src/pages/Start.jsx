import React from 'react'
import { Link } from 'react-router-dom'
import homeBg from '../assets/home-bg.jpg'

const Start = () => {
  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center items-center">
      <div 
        className="h-screen w-full max-w-md bg-cover bg-center flex flex-col justify-between shadow-2xl relative overflow-hidden"
        style={{ backgroundImage: `url(${homeBg})` }}
      >
        {/* Top Logo */}
        <div className="pt-8 pl-8 z-10">
          <img 
            className="w-16 drop-shadow-sm" 
            src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" 
            alt="Uber" 
          />
        </div>

        {/* Bottom Action Sheet */}
        <div className="bg-white py-6 px-6 pb-8 rounded-t-3xl sm:rounded-none z-10 shadow-lg">
          <h2 className="text-2xl sm:text-[30px] font-bold text-gray-900 tracking-tight mb-5">
            Get Started with Uber
          </h2>
          <Link
            to="/login"
            className="flex items-center justify-center w-full bg-black text-white font-medium py-3.5 px-4 rounded-lg text-lg hover:bg-neutral-800 active:scale-[0.99] transition duration-200"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Start
