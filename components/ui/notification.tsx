import React from 'react';
import { Toaster } from 'sonner';

export function NotificationProvider() {
  return (
    <Toaster 
      position="top-right" 
      richColors 
      expand={true}
      toastOptions={{
        style: {
          background: 'var(--background)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          fontSize: '14px',
          fontWeight: '500',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        className: 'notification-toast',
        duration: 5000,
      }}
      theme="system"
    />
  );
}

export default NotificationProvider;