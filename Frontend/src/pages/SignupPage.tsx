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
    <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 bg-white dark:bg-[#1a1a1a] w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[#1E3A8A] dark:text-[#E0F2FE] text-lg font-medium">Rental Management</h1>
          <div className="flex items-center space-x-2">
            <button onClick={toggle} className="p-2 rounded-lg text-[#1E3A8A] hover:bg-gray-100 dark:text-[#E0F2FE] dark:hover:bg-[#2a2a2a]" title="Toggle theme">{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
            <button onClick={() => navigate('/customer/dashboard')} className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-700 transition-colors">Home</button>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-black dark:text-gray-300 mb-2">Your Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-black dark:text-gray-300 mb-2">Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-black dark:text-gray-300 mb-2">Your Phone</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9098980900"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-black dark:text-gray-300 mb-2">Are you a Customer or an End User?</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value === 'admin' ? 'admin' : 'customer')}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white"
            >
              <option value="customer">Customer</option>
              <option value="admin">End User</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-black dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white"
              required
            />
            <div className="mt-2">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                <div className={`h-2 ${strength.bar}`}></div>
              </div>
              <p className={`text-xs mt-1 ${strength.color}`}>Password strength: {strength.label}</p>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-black dark:text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:bg-[#121212] dark:border-gray-700 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mt-8"
          >
            REGISTER
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            already have account? <Link to="/login" className="text-[#1E3A8A] dark:text-[#E0F2FE] hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;