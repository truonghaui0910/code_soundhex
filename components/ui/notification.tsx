
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  showProgress?: boolean;
}

const NotificationIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const NotificationStyles = {
  success: {
    container: 'bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-emerald-300 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40 dark:border-emerald-700/60 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-emerald-900 dark:text-emerald-100 font-semibold',
    message: 'text-emerald-800 dark:text-emerald-200',
    progress: 'bg-gradient-to-r from-emerald-500 to-green-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  error: {
    container: 'bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border-red-300 dark:from-red-950/40 dark:via-rose-950/40 dark:to-pink-950/40 dark:border-red-700/60 shadow-lg shadow-red-100/50 dark:shadow-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100 font-semibold',
    message: 'text-red-800 dark:text-red-200',
    progress: 'bg-gradient-to-r from-red-500 to-rose-500',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
  },
  warning: {
    container: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-300 dark:from-amber-950/40 dark:via-yellow-950/40 dark:to-orange-950/40 dark:border-amber-700/60 shadow-lg shadow-amber-100/50 dark:shadow-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-900 dark:text-amber-100 font-semibold',
    message: 'text-amber-800 dark:text-amber-200',
    progress: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
  },
  info: {
    container: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border-blue-300 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-cyan-950/40 dark:border-blue-700/60 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100 font-semibold',
    message: 'text-blue-800 dark:text-blue-200',
    progress: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
  },
};

const PositionStyles = {
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-center': 'top-6 left-1/2 transform -translate-x-1/2',
};

export function Notification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  position = 'top-right',
  showProgress = true,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isEntering, setIsEntering] = useState(true);
  const [progress, setProgress] = useState(100);

  const Icon = NotificationIcons[type];
  const styles = NotificationStyles[type];
  const positionClass = PositionStyles[position];

  useEffect(() => {
    // Animation khi vào
    const enterTimer = setTimeout(() => setIsEntering(false), 100);
    
    if (duration > 0) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            clearInterval(progressInterval);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(enterTimer);
      };
    }

    return () => clearTimeout(enterTimer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed z-[9999] max-w-md w-full transition-all duration-300 ease-out',
        positionClass,
        isEntering ? 'translate-y-[-20px] opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100',
        !isVisible && 'translate-y-[-20px] opacity-0 scale-95'
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border-2 backdrop-blur-md p-4 min-h-[80px]',
          styles.container
        )}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 hover:scale-110 z-10"
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Main Content */}
        <div className="flex items-start gap-4 pr-8">
          {/* Icon with background */}
          <div className={cn('rounded-full p-2 flex-shrink-0', styles.iconBg)}>
            <Icon className={cn('h-6 w-6', styles.icon)} />
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-1 min-w-0">
            <h4 className={cn('text-sm leading-snug', styles.title)}>
              {title}
            </h4>
            {message && (
              <p className={cn('text-sm leading-relaxed', styles.message)}>
                {message}
              </p>
            )}
            
            {/* Duration indicator */}
            {duration > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                <Clock className="h-3 w-3" />
                <span>{Math.ceil((duration * progress) / 100 / 1000)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
            <div
              className={cn(
                'h-full transition-all duration-100 ease-linear rounded-full',
                styles.progress
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-xl" />
      </div>
    </div>
  );
}

export default Notification;
