import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { UserDataContext } from '../context/UserContext';
import BrandLogo from '../components/common/BrandLogo';

const UserLogout = () => {
  const token = localStorage.getItem('userToken');
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  useEffect(() => {
    const handleLogout = async () => {
      if (!token) {
        setUser(null);
        navigate('/login');
        return;
      }

      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

      try {
        // Updated from axios.get to axios.post
        await axios.post(
          `${baseUrl}/users/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.error('User logout error:', err);
      } finally {
        localStorage.removeItem('userToken');
        setUser(null);
        navigate('/login');
      }
    };

    handleLogout();
  }, [token, navigate, setUser]);

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