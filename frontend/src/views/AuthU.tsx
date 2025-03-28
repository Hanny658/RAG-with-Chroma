// src/views/AuthU.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthU: React.FC = () => {
  const [inputPwd, setInputPwd] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const storedPwd = import.meta.env.VITE_ENTRE_PWD;

  useEffect(() => {
    const user = Cookies.get('user');
    if (user) {
      navigate('/management');
    }
  }, [navigate]);

  const handleSubmit = () => {
    if (inputPwd === storedPwd) {
      Cookies.set('user', 'authenticated', { expires: 7 });
      navigate('/management');
    } else {
      setError('Wrong password. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="p-6 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Please Enter Password: </h2>
        <input
          type="password"
          value={inputPwd}
          onChange={(e) => setInputPwd(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Password..."
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={handleSubmit}
          className="w-full !bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default AuthU;
