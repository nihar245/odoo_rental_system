import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.message || 'Login failed');
      }
      const u = payload?.data?.user;
      if (!u) throw new Error('Invalid response');
      const appUser = {
        id: u._id,
        email: u.email,
        name: u.name,
        role: u.role,
      } as const;
      setUser(appUser as any);
      navigate(appUser.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
    } catch (err: any) {
      alert(err?.message || 'Unable to login');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center p-4 sm:p-6">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#1a1a1a] w-full max-w-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-3 sm:space-y-0">
          <h1 className="text-[#1E3A8A] dark:text-[#E0F2FE] text-lg sm:text-xl font-medium">Rental Management</h1>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button onClick={toggle} className="p-2 rounded-lg text-[#1E3A8A] hover:bg-gray-100 dark:text-[#E0F2FE] dark:hover:bg-[#2a2a2a]" title="Toggle theme">{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
            <button onClick={() => navigate('/customer/dashboard')} className="px-3 sm:px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">Home</button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-black dark:text-gray-300 text-sm sm:text-base font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white text-sm sm:text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-black dark:text-gray-300 text-sm sm:text-base font-medium">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white text-sm sm:text-base"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 sm:py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            SIGN IN
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Don't have account? <Link to="/signup" className="text-[#1E3A8A] dark:text-[#E0F2FE] hover:underline">Register here</Link>
          </p>
          <p className="text-[#1E3A8A] dark:text-[#E0F2FE] hover:underline cursor-pointer text-sm sm:text-base">Forgot username / password</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;