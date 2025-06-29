
import React from 'react';
import { Toaster } from 'sonner';

export function NotificationProvider() {
  return (
    <Toaster 
      position="top-right" 
      richColors={false} // Disable rich colors to use custom styling
      expand={true}
      closeButton={true} // Enable close button
      toastOptions={{
        style: {
          background: 'hsl(220 15% 20%)',
          border: '1px solid hsl(220 15% 30%)',
          color: 'hsl(0 0% 90%)',
          fontSize: '14px',
          fontWeight: '500',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          minHeight: '60px',
          padding: '16px 40px 16px 16px', // Add right padding for close button
          opacity: '1',
          position: 'relative',
        },
        className: 'custom-toast',
        duration: 5000,
        unstyled: false,
      }}
      theme="dark"
    />
  );
}

export default NotificationProvider;
