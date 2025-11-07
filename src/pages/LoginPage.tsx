import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockClosedIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#090c1a] dark:via-[#04030f] dark:to-[#0e162d] transition-colors duration-700">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Light theme blobs */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:opacity-20"></div>
        <div className="absolute top-40 left-40 h-80 w-80 rounded-full bg-pink-300 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:opacity-30"></div>

        {/* Dark theme animated nebula */}
        <motion.div
          className="pointer-events-none hidden dark:block absolute -top-32 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.35),_rgba(79,70,229,0))] blur-3xl"
          animate={{ x: ['-10%', '15%', '-5%'], y: ['-10%', '5%', '-12%'], rotate: [0, 20, -10] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none hidden dark:block absolute bottom-[-18rem] right-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.35),_rgba(168,85,247,0))] blur-3xl"
          animate={{ x: ['0%', '-20%', '10%'], y: ['0%', '12%', '-8%'], rotate: [0, -25, 15] }}
          transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.div
          className="pointer-events-none hidden dark:block absolute inset-x-0 bottom-[-22rem] mx-auto h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.28),_rgba(14,165,233,0))] blur-3xl"
          animate={{ scale: [0.95, 1.08, 0.92], opacity: [0.45, 0.65, 0.5] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.8 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md px-6"
      >
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:bg-slate-900/90 dark:border-slate-800/80 dark:shadow-black/40 transition-colors duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4"
            >
              <LockClosedIcon className="h-10 w-10 text-blue-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Bảng điều khiển quản trị</h1>
            <p className="text-blue-100">Hệ thống chia sẻ xe máy</p>
          </div>

          {/* Form */}
          <div className="px-8 py-10 bg-white dark:bg-slate-900/90 transition-colors duration-500">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
                  Địa chỉ email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/40"
                    placeholder="admin@mssus.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/40"
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-400"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-slate-600 dark:bg-slate-900"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-slate-300">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-slate-800/60 dark:border-slate-700">
              <p className="text-xs font-medium text-blue-800 mb-2 dark:text-indigo-200">Tài khoản quản trị dùng thử:</p>
              <div className="text-xs text-blue-700 space-y-1 dark:text-indigo-100">
                <p>Email: <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-200">admin@mssus.com</span></p>
                <p>Mật khẩu: <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-200">Password1!</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
          &copy; 2025 MSSUS. Giữ toàn bộ bản quyền.
        </p>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
