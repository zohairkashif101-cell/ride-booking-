import { Route, Routes } from 'react-router-dom'

import Start from './pages/Start'
import Home from './pages/Home'
import Payment from './pages/payment'

import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'

import Captainlogin from './pages/Captainlogin'
import CaptainSignup from './pages/CaptainSignup'
import CaptainHome from './pages/CaptainHome'

import UserProtectWrapper from './pages/UserProtectWrapper'
import CaptainProtectWrapper from './pages/CaptainProtectWrapper'

import UserLogout from './pages/UserLogout'
import CaptainLogout from './pages/CaptainLogout'

const App = () => {
  return (
    <div>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Start />} />

        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />

        <Route path="/captain-login" element={<Captainlogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />

        {/* Protected User Routes */}

        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          }
        />

        <Route
          path="/payment/:rideId/:amount"
          element={
            <UserProtectWrapper>
              <Payment />
            </UserProtectWrapper>
          }
        />

        <Route
          path="/user/logout"
          element={<UserLogout />}
        />

        {/* Protected Captain Routes */}

        <Route
          path="/captain-home"
          element={
            <CaptainProtectWrapper>
              <CaptainHome />
            </CaptainProtectWrapper>
          }
        />

        <Route
          path="/captain/logout"
          element={<CaptainLogout />}
        />

      </Routes>
    </div>
  )
}

export default App