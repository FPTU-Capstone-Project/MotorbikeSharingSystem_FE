import React, { memo, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface EnhancedButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const EnhancedButton = memo(forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200 active:bg-blue-800',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200 active:bg-gray-300',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 active:bg-red-800'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg'
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        whileHover={disabled || loading ? {} : { scale: 1.02 }}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading && (
          <div className="mr-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-current rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-current rounded-full loading-dot"></div>
            </div>
          </div>
        )}
        
        {leftIcon && !loading && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        <span>{children}</span>
        
        {rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
));

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;