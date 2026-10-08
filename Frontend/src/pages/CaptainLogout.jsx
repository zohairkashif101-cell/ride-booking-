import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CaptainDataContext } from '../context/CaptainContext';
import BrandLogo from '../components/common/BrandLogo';

const CaptainLogout = () => {
  const token = localStorage.getItem('captainToken');
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  useEffect(() => {
    const handleLogout = async () => {
      if (!token) {
        setCaptain(null);
        navigate('/captain-login');
        return;
      }

      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

      try {
        // Updated from axios.get to axios.post
        await axios.post(
          `${baseUrl}/captains/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.error('Captain logout error:', err);
      } finally {
        localStorage.removeItem('captainToken');
        setCaptain(null);
        navigate('/captain-login');
      }
    };

    handleLogout();
  }, [token, navigate, setCaptain]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo inverted showSubtitle textClassName="text-2xl" />
        <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-emerald-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Signing out captain session...</span>
        </div>
      </div>
    </div>
  );
};

export default CaptainLogout;
