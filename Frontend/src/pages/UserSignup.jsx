import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

const UserSignup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate()
  const { setUser } = useContext(UserDataContext)

  const submitHandler = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password
    }

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'
      const response = await axios.post(
        `${baseUrl}/users/register`,
        newUser
      )

      if (response.status === 201) {
        const data = response.data
        setUser(data.user)
        localStorage.setItem('token', data.token)
        navigate('/home')
      }
    } catch (err) {
      console.error('Registration error:', err)
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed'
      setErrorMessage(msg)
    }

    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center items-center sm:py-6">
      <div className="h-screen sm:h-211 w-full max-w-md bg-white flex flex-col justify-between p-7 shadow-2xl sm:rounded-3xl overflow-y-auto">
        {/* Top Section */}
        <div>
          <img
            className="w-16 mb-8"
            src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
            alt="Uber"
          />

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={submitHandler}>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              What's your name
            </h3>
            <div className="flex gap-3 mb-6">
              <input
                required
                className="bg-[#eeeeee] w-1/2 rounded-lg px-4 py-3 border border-transparent focus:border-gray-400 text-base placeholder:text-base placeholder:text-gray-400 outline-none transition"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                className="bg-[#eeeeee] w-1/2 rounded-lg px-4 py-3 border border-transparent focus:border-gray-400 text-base placeholder:text-base placeholder:text-gray-400 outline-none transition"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <h3 className="text-lg font-medium mb-2 text-gray-900">
              What's your email
            </h3>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#eeeeee] mb-6 rounded-lg px-4 py-3 border border-transparent focus:border-gray-400 w-full text-base placeholder:text-base placeholder:text-gray-400 outline-none transition"
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
              className="bg-[#eeeeee] mb-6 rounded-lg px-4 py-3 border border-transparent focus:border-gray-400 w-full text-base placeholder:text-base placeholder:text-gray-400 outline-none transition"
              type="password"
              placeholder="password"
            />

            <button
              type="submit"
              className="bg-[#111111] text-white font-semibold mb-3 rounded-lg px-4 py-3 w-full text-lg hover:bg-neutral-800 active:scale-[0.99] transition cursor-pointer"
            >
              Create User Account
            </button>
          </form>

          <p className="text-center font-normal text-gray-800 text-base mt-2">
            Already have a account?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* Bottom Legal Notice */}
        <div className="pt-6 pb-2">
          <p className="text-[10px] sm:text-[11px] leading-tight text-gray-500">
            This site is protected by reCAPTCHA and the{' '}
            <span className="underline cursor-pointer text-gray-700">
              Google Privacy Policy
            </span>{' '}
            and{' '}
            <span className="underline cursor-pointer text-gray-700">
              Terms of Service apply
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserSignup
