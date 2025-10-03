import React, { useState, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  MapIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Verification', href: '/verification', icon: DocumentCheckIcon },
  { name: 'Vehicle Verification', href: '/vehicle-verification', icon: DocumentCheckIcon },
  { name: 'Rides', href: '/rides', icon: MapIcon },
  { name: 'Payments', href: '/payments', icon: CreditCardIcon },
  { name: 'Safety', href: '/safety', icon: ShieldCheckIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
];

const Layout = memo(({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);
  
  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={closeSidebar}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl lg:hidden border-r border-white/20"
          >
            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">MSSUS</h1>
                  <p className="text-xs text-gray-500 font-medium">Admin Portal</p>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent location={location} closeSidebar={closeSidebar} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl">
            <div className="flex items-center h-20 px-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">MSSUS</h1>
                  <p className="text-sm text-gray-500 font-medium">Admin Portal</p>
                </div>
              </div>
            </div>
            <SidebarContent location={location} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="flex items-center justify-between h-20 px-6">
            <div className="flex items-center">
              <button
                onClick={openSidebar}
                className="p-3 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all duration-200 lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="w-80 pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-300 transition-all duration-200 text-sm placeholder-gray-400 backdrop-blur-sm"
                    placeholder="Search users, rides, or transactions..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button className="relative p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-xl transition-all duration-200 group">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-semibold shadow-lg animate-pulse">
                  3
                </span>
              </button>
              <div className="flex items-center space-x-3 bg-gray-50/80 rounded-2xl px-4 py-2 border border-gray-200/60 hover:bg-white/80 transition-all duration-200">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">Admin User</span>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

const SidebarContent = memo(({ location, closeSidebar }: { location: any; closeSidebar?: () => void }) => {
  return (
    <nav className="flex-1 px-6 py-8 space-y-3">
      {navigation.map((item, index) => {
        const isActive = location.pathname === item.href;
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Link
              to={item.href}
              onClick={closeSidebar}
              className={cn(
                'group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:scale-105'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBackground"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  'relative mr-4 h-5 w-5 transition-all duration-300',
                  isActive 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-gray-400 group-hover:text-indigo-600 group-hover:scale-110'
                )}
                aria-hidden="true"
              />
              <span className="relative">{item.name}</span>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto w-2 h-2 bg-white/60 rounded-full"
                />
              )}
            </Link>
          </motion.div>
        );
      })}
      
      <div className="pt-8 mt-8 border-t border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Status: Operational</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">v2.1.0 • Updated 2 hours ago</p>
        </div>
      </div>
    </nav>
  );
});

SidebarContent.displayName = 'SidebarContent';

export default Layout;