import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainSignup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [vehicleColor, setVehicleColor] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleCapacity, setVehicleCapacity] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { setCaptain } = useContext(CaptainDataContext)
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const fullNameString = `${firstName} ${lastName}`.trim()

    const captainData = {
      name: fullNameString,
      email: email,
      password: password,
      role: 'driver', // Backend schema se match karne ke liye
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: Number(vehicleCapacity),
        vehicleType: vehicleType
      }
    }

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'
      const response = await axios.post(
        `${baseUrl}/api/auth/register`,
        captainData
      )

      if (response.status === 201 || response.status === 200) {
        const data = response.data
        setCaptain(data.user)
        if (data.token) {
          localStorage.setItem('token', data.token)
        }
        navigate('/captain-home')
      }
    } catch (err) {
      console.error('Captain signup error:', err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Captain registration failed'
      setErrorMessage(msg)
    }

    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setVehicleColor('')
    setVehiclePlate('')
    setVehicleCapacity('')
    setVehicleType('')
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center items-center sm:py-6">
      <div className="h-screen sm:h-auto sm:min-h-211 w-full max-w-md bg-white flex flex-col justify-between p-7 shadow-2xl sm:rounded-3xl overflow-y-auto">
        <div>
          <div className="mb-5">
            <img
              className="w-16 mb-2"
              src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
              alt="Uber"
            />
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={submitHandler}>
            <h3 className="text-base font-medium mb-2 text-gray-900">
              What's our Captain's name
            </h3>
            <div className="flex gap-3 mb-4">
              <input
                required
                className="bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2.5 border border-transparent focus:border-gray-400 text-sm sm:text-base placeholder:text-gray-400 outline-none transition"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                className="bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2.5 border border-transparent focus:border-gray-400 text-sm sm:text-base placeholder:text-gray-400 outline-none transition"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <h3 className="text-base font-medium mb-2 text-gray-900">
              What's our Captain's email
            </h3>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#eeeeee] mb-4 rounded-lg px-4 py-2.5 border border-transparent focus:border-gray-400 w-full text-sm sm:text-base placeholder:text-gray-400 outline-none transition"
              type="email"
              placeholder="email@example.com"
            />

            <h3 className="text-base font-medium mb-2 text-gray-900">
              Enter Password (min 6 chars)
            </h3>
            <input
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#eeeeee] mb-4 rounded-lg px-4 py-2.5 border border-transparent focus:border-gray-400 w-full text-sm sm:text-base placeholder:text-gray-400 outline-none transition"
              type="password"
              placeholder="password"
            />

            <h3 className="text-base font-medium mb-2 text-gray-900">
              Vehicle Information
            </h3>
            <div className="flex gap-3 mb-3">
              <input
                required
                className="bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2.5 border border-transparent focus:border-gray-400 text-sm sm:text-base placeholder:text-gray-400 outline-none transition"
                type="text"
                placeholder="Vehicle Color"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
              />
              <input
                required
                className="bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2.5 border border-transparent focus:border-gray-400 text-sm sm:text-base placeholder:text-gray-400 outline-none transition"
                type="text"
                placeholder="Vehicle Plate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
              />
            </div>

            <div className="flex gap-3 mb-5">
              <input
                required
                className="bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2.5 border border-transparent focus:border-gray-400 text-sm sm:text-base placeholder:text-gray-400 outline-none transition"
                type="number"
                min="1"
                placeholder="Vehicle Capacity"
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
              />
              <select
                required
                className="bg-[#eeeeee] w-1/2 rounded-lg px-3 py-2.5 border border-transparent focus:border-gray-400 text-sm sm:text-base text-gray-700 outline-none transition cursor-pointer"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="" disabled>
                  Select Vehicle Type
                </option>
                <option value="car">Car</option>
                <option value="auto">Auto</option>
                <option value="moto">Moto</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-[#111111] text-white font-semibold mb-3 rounded-lg px-4 py-3 w-full text-base sm:text-lg hover:bg-neutral-800 active:scale-[0.99] transition cursor-pointer"
            >
              Create Captain Account
            </button>
          </form>

          <p className="text-center font-normal text-gray-800 text-sm sm:text-base mt-2">
            Already have an account?{' '}
            <Link
              to="/captain-login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CaptainSignup