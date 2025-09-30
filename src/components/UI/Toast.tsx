import React, { useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type: 'success' | 'warning' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-100', 
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800', 
      iconColor: 'text-red-600'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${config.bgColor} ${config.textColor} px-4 py-3 rounded-md shadow-lg flex items-center space-x-3 max-w-sm`}>
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className={`${config.textColor} hover:opacity-75 ml-auto`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;