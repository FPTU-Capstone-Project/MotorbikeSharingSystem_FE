import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';
import ThemeToggle from '../components/ThemeToggle';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = emailOrPhone.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập email hoặc số điện thoại liên kết với tài khoản quản trị.');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPassword({ emailOrPhone: trimmed });
      const message =
        response?.message ||
        'Nếu có tài khoản trùng khớp, hướng dẫn đặt lại mật khẩu sẽ được gửi tới bạn trong giây lát.';

      setSuccessMessage(message);
      toast.success(message);
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        'Không thể yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.';
      toast.error(message);
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -right-32 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl opacity-40 animate-blob dark:opacity-30" />
        <div className="absolute -bottom-48 -left-32 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000 dark:opacity-25" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4000 dark:opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg px-6"
      >
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:bg-slate-900/90 dark:border-slate-800/80 dark:shadow-black/40 transition-colors duration-500">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg shadow-indigo-900/30"
            >
              <EnvelopeIcon className="h-10 w-10 text-indigo-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">Quên mật khẩu</h1>
            <p className="text-blue-100 mt-2">
              Nhập email hoặc số điện thoại liên kết với tài khoản quản trị để nhận hướng dẫn đặt lại mật khẩu.
            </p>
          </div>

          <div className="px-8 py-10 bg-white dark:bg-slate-900/90 transition-colors duration-500">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
                  Email hoặc số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                  </div>
                  <input
                    id="emailOrPhone"
                    name="emailOrPhone"
                    type="text"
                    value={emailOrPhone}
                    onChange={(event) => setEmailOrPhone(event.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/40"
                    placeholder="admin@mssus.com hoặc +84 912 345 678"
                    autoComplete="username"
                  />
                </div>
              </div>

              {successMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100">
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-500 dark:text-emerald-300" />
                  <p className="dark:text-emerald-100">{successMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-900/20 dark:focus:ring-offset-slate-900"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang gửi hướng dẫn...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5 rotate-[-8deg]" />
                    Gửi liên kết đặt lại
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Quay lại trang đăng nhập
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Gặp khó khăn? Liên hệ đội ngũ MSSUS để được hỗ trợ xác minh quyền quản trị.
        </p>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.08); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
        }
        .animate-blob {
          animation: blob 8s infinite;
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
