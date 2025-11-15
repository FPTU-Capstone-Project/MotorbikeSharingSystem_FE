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
  const [loginType, setLoginType] = useState<'admin' | 'staff'>('admin');
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
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-all duration-700 ease-in-out">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light mode gradient blobs */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:hidden"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:hidden"></div>
        <div className="absolute top-40 left-40 h-80 w-80 rounded-full bg-pink-300 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:hidden"></div>

        {/* Dark mode gradient effects */}
        <motion.div
          className="pointer-events-none hidden dark:block absolute -top-32 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.25),_rgba(79,70,229,0))] blur-3xl"
          animate={{ x: ['-10%', '15%', '-5%'], y: ['-10%', '5%', '-12%'], rotate: [0, 20, -10] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none hidden dark:block absolute bottom-[-18rem] right-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.25),_rgba(168,85,247,0))] blur-3xl"
          animate={{ x: ['0%', '-20%', '10%'], y: ['0%', '12%', '-8%'], rotate: [0, -25, 15] }}
          transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.div
          className="pointer-events-none hidden dark:block absolute inset-x-0 bottom-[-22rem] mx-auto h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.2),_rgba(14,165,233,0))] blur-3xl"
          animate={{ scale: [0.95, 1.08, 0.92], opacity: [0.35, 0.55, 0.4] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.8 }}
        />
      </div>

      {/* Left Section - Information Card */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-lg"
        >
          {/* Gradient Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_70%)]"></div>
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 30%, rgba(37,99,235,0.4), transparent 50%)',
                    'radial-gradient(circle at 80% 70%, rgba(79,70,229,0.4), transparent 50%)',
                    'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.4), transparent 50%)',
                    'radial-gradient(circle at 20% 30%, rgba(37,99,235,0.4), transparent 50%)',
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-12 text-white transition-colors duration-500">
              <h1 className="text-5xl font-bold mb-4 text-white transition-colors duration-500">Hệ thống quản lý MSSUS</h1>
              <p className="text-xl text-white leading-relaxed transition-colors duration-500">
                Trang web quản lý hệ thống chia sẻ xe máy cho sinh viên đại học. 
                Hệ thống cung cấp các tính năng quản lý người dùng, phương tiện, 
                chuyến đi và thanh toán một cách hiệu quả và an toàn.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Login Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 transition-all duration-500 ease-in-out">
            {/* Header */}
            <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-6"
            >
              <LockClosedIcon className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-500">Đăng nhập tài khoản</h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-500">Nhập thông tin cá nhân để đăng nhập vào tài khoản của bạn.</p>
          </div>

          {/* Login Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-500">
              Loại tài khoản
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-500 ${
                  loginType === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Quản trị viên
              </button>
              <button
                type="button"
                onClick={() => setLoginType('staff')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-500 ${
                  loginType === 'staff'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Nhân viên
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-500">
                Địa chỉ email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="eg. admin@mssus.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-500">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Mật khẩu phải có ít nhất 8 ký tự.</p>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-500">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
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
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg transition-all duration-500">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-500">Tài khoản quản trị dùng thử:</p>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 transition-colors duration-500">
              <p>Email: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">admin@mssus.com</span></p>
              <p>Mật khẩu: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">Password1!</span></p>
            </div>
          </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-600 dark:text-gray-400">
              &copy; 2025 MSSUS. Giữ toàn bộ bản quyền.
            </p>
          </div>
        </motion.div>
      </div>

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
