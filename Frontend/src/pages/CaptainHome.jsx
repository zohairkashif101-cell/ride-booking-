import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainHome = () => {
    const { captain } = useContext(CaptainDataContext)

    return (
        <div className="h-screen relative overflow-hidden bg-gray-100 flex flex-col justify-between">
            {/* Top Logo & Logout */}
            <div className="absolute top-5 left-5 right-5 z-20 flex justify-between items-center">
                <img
                    className="w-16"
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                    alt="Uber"
                />
                <Link
                    to="/captain/logout"
                    className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition active:scale-95"
                    title="Logout Captain"
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                </Link>
            </div>

            {/* Background Simulator */}
            <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                <div className="text-center p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 max-w-sm mx-4">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
                        Online Captain
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Captain {captain?.fullname?.firstname || 'Driver'}!
                    </h1>
                    <p className="text-gray-600 text-sm mb-4">{captain?.email}</p>

                    {/* Vehicle Badges */}
                    <div className="grid grid-cols-2 gap-2 text-left bg-gray-50 p-3.5 rounded-xl text-xs border border-gray-100">
                        <div>
                            <span className="text-gray-400 block font-medium">Vehicle Type</span>
                            <span className="font-semibold text-gray-800 capitalize">{captain?.vehicle?.vehicleType || 'Car'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 block font-medium">Plate Number</span>
                            <span className="font-semibold text-gray-800 uppercase">{captain?.vehicle?.plate || 'ABC-123'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 block font-medium">Color</span>
                            <span className="font-semibold text-gray-800 capitalize">{captain?.vehicle?.color || 'Black'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 block font-medium">Capacity</span>
                            <span className="font-semibold text-gray-800">{captain?.vehicle?.capacity || '4'} Persons</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Status Card */}
            <div className="absolute bottom-0 w-full bg-white p-6 rounded-t-3xl shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg">
                            {captain?.fullname?.firstname?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 capitalize">
                                {captain?.fullname?.firstname} {captain?.fullname?.lastname}
                            </h4>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Ready for ride requests
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h5 className="text-xl font-bold text-gray-900">₹0.00</h5>
                        <p className="text-xs text-gray-500">Today's Earned</p>
                    </div>
                </div>

                <div className="flex justify-around bg-gray-50 py-3 rounded-xl border border-gray-100 text-center">
                    <div>
                        <i className="ri-timer-2-line text-lg text-gray-600 font-normal"></i>
                        <h5 className="text-base font-semibold text-gray-800">10.2</h5>
                        <p className="text-xs text-gray-400">Hours Online</p>
                    </div>
                    <div>
                        <i className="ri-speed-up-line text-lg text-gray-600 font-normal"></i>
                        <h5 className="text-base font-semibold text-gray-800">30 KM</h5>
                        <p className="text-xs text-gray-400">Distance</p>
                    </div>
                    <div>
                        <i className="ri-booklet-line text-lg text-gray-600 font-normal"></i>
                        <h5 className="text-base font-semibold text-gray-800">12</h5>
                        <p className="text-xs text-gray-400">Total Trips</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CaptainHome
