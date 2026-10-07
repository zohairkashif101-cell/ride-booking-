import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaptainDataContext } from '../context/CaptainContext';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

const CaptainProtectWrapper = ({ children }) => {
  const token = localStorage.getItem('captainToken');
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/captain-login');
      return;
    }

    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

    axios
      .get(`${baseUrl}/captains/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setCaptain(response.data.captain || response.data);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Captain profile auth error:', error.response?.data || error.message);
        localStorage.removeItem('captainToken');
        navigate('/captain-login');
      });
  }, [token, navigate, setCaptain]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
        <div className="flex flex-col items-center gap-4">
          <BrandLogo inverted showSubtitle textClassName="text-2xl" />
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-emerald-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Verifying captain credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default CaptainProtectWrapper;