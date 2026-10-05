import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CaptainLogout = () => {
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            navigate('/captain-login')
            return
        }

        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'

        axios.get(`${baseUrl}/captains/logout`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            if (response.status === 200) {
                localStorage.removeItem('token')
                navigate('/captain-login')
            }
        }).catch((err) => {
            console.error('Captain logout error:', err)
            localStorage.removeItem('token')
            navigate('/captain-login')
        })
    }, [token, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Logging out Captain...</p>
            </div>
        </div>
    )
}

export default CaptainLogout
