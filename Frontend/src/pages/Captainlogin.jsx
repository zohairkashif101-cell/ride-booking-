import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CaptainContext'

const Captainlogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { setCaptain } = useContext(CaptainDataContext)
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const captainData = {
      email: email,
      password: password
    }

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'
      const response = await axios.post(
        `${baseUrl}/api/auth/login`,
        captainData
      )

      if (response.status === 200) {
        const data = response.data
        if (setCaptain) setCaptain(data.user)
        if (data.token) localStorage.setItem('token', data.token)
        navigate('/captain-home')
      }
    } catch (err) {
      console.error('Captain login error:', err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Invalid email or password'
      setErrorMessage(msg)
    }

    setEmail('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center items-center sm:py-6">
      <div className="h-screen sm:h-211 w-full max-w-md bg-white flex flex-col justify-between p-7 shadow-2xl sm:rounded-3xl overflow-y-auto">
        <div>
          <img
            className="w-16 mb-10"
            src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
            alt="Uber Captain"
          />

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={submitHandler}>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              What's your email
            </h3>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#eeeeee] mb-7 rounded-lg px-4 py-3 border border-transparent focus:border-gray-400 w-full text-lg placeholder:text-base placeholder:text-gray-400 outline-none transition"
              type="email"
              placeholder="email@example.com"
            />

            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Enter Password
            </h3>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#eeeeee] mb-7 rounded-lg px-4 py-3 border border-transparent focus:border-gray-400 w-full text-lg placeholder:text-base placeholder:text-gray-400 outline-none transition"
              type="password"
              placeholder="password"
            />

            <button
              type="submit"
              className="bg-[#111111] text-white font-semibold mb-3 rounded-lg px-4 py-3 w-full text-lg hover:bg-neutral-800 active:scale-[0.99] transition cursor-pointer"
            >
              Login as Captain
            </button>
          </form>

          <p className="text-center font-normal text-gray-800 text-base mt-2">
            Join a fleet?{' '}
            <Link
              to="/captain-signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Register as a Captain
            </Link>
          </p>
        </div>

        <div className="pt-6">
          <Link
            to="/login"
            className="bg-[#d5622d] flex items-center justify-center text-white font-semibold rounded-lg px-4 py-3.5 w-full text-lg hover:bg-[#bd5322] active:scale-[0.99] transition"
          >
            Sign in as User
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Captainlogin