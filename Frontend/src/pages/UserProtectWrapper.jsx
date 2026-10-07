import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

const UserProtectWrapper = ({ children }) => {
  const token = localStorage.getItem('userToken');
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

    axios
      .get(`${baseUrl}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('User profile auth error:', err);
        localStorage.removeItem('userToken');
        navigate('/login');
      });
  }, [token, navigate, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
        <div className="flex flex-col items-center gap-4">
          <BrandLogo inverted showSubtitle textClassName="text-2xl" />
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Verifying rider session...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default UserProtectWrapper;
