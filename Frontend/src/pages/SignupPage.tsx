import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const strength = useMemo(() => {
    const len = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNum = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    let score = 0;
    if (len >= 8) score++;
    if (hasLower && hasUpper) score++;
    if (hasNum) score++;
    if (hasSpecial) score++;
    if (len >= 12) score++;
    if (score >= 4) return { label: 'Strong', color: 'text-green-400', bar: 'bg-green-500 w-3/3' } as const;
    if (score >= 2) return { label: 'Medium', color: 'text-yellow-400', bar: 'bg-yellow-500 w-2/3' } as const;
    return { label: 'Weak', color: 'text-red-400', bar: 'bg-red-500 w-1/3' } as const;
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/api/v1/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          name,
          phone_number: phone,
          password,
          role,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.message || 'Registration failed');
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
      alert(err?.message || 'Unable to register');
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

        <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-black dark:text-gray-300 text-sm sm:text-base font-medium">Your Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white text-sm sm:text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-black dark:text-gray-300 text-sm sm:text-base font-medium">Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white text-sm sm:text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-black dark:text-gray-300 text-sm sm:text-base font-medium">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white text-sm sm:text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-black dark:text-gray-300 text-sm sm:text-base font-medium">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'customer' | 'admin')}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white text-sm sm:text-base"
              required
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-black dark:text-gray-300 text-sm sm:text-base font-medium">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white text-sm sm:text-base"
              required
            />
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${strength.bar}`}></div>
                </div>
                <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-black dark:text-gray-300 text-sm sm:text-base font-medium">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white text-sm sm:text-base"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 sm:py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            CREATE ACCOUNT
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Already have an account? <Link to="/login" className="text-[#1E3A8A] dark:text-[#E0F2FE] hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;