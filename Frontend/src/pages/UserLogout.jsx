import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

const UserLogout = () => {
  const token = localStorage.getItem('userToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

    axios
      .get(`${baseUrl}/users/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        localStorage.removeItem('userToken');
        navigate('/login');
      })
      .catch((err) => {
        console.error('User logout error:', err);
        localStorage.removeItem('userToken');
        navigate('/login');
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo inverted showSubtitle textClassName="text-2xl" />
        <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Signing out rider session...</span>
        </div>
      </div>
    </div>
  );
};

export default UserLogout;
