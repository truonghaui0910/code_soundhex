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
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--card-foreground))',
          fontSize: '14px',
          fontWeight: '500',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          minHeight: '60px',
          padding: '16px',
        },
        className: 'notification-toast',
        duration: 5000,
      }}
      theme="system"
    />
  );
}

export default NotificationProvider;