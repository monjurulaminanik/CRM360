import { Toaster, toast as hotToast } from 'react-hot-toast';

export const ToastProvider = ({ position = 'top-right' }) => (
  <Toaster
    position={position}
    gutter={8}
    toastOptions={{
      duration: 4000,
      style: {
        background: '#ffffff',
        color: '#1A1A2E',
        borderRadius: '0.75rem',
        border: '1px solid #F3F4F6',
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.10)',
        fontSize: '0.875rem',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '12px 16px',
        maxWidth: '380px',
      },
      success: {
        iconTheme: { primary: '#10B981', secondary: '#ffffff' },
        style: {
          background: '#ffffff',
          borderLeft: '3px solid #10B981',
        },
      },
      error: {
        iconTheme: { primary: '#EF4444', secondary: '#ffffff' },
        style: {
          background: '#ffffff',
          borderLeft: '3px solid #EF4444',
        },
      },
      loading: {
        iconTheme: { primary: '#2D55FF', secondary: '#E8ECFF' },
      },
    }}
  />
);

const toast = {
  success: (message, opts) => hotToast.success(message, opts),
  error:   (message, opts) => hotToast.error(message, opts),
  warning: (message, opts) =>
    hotToast(message, {
      icon: '⚠️',
      style: {
        background: '#ffffff',
        borderLeft: '3px solid #F59E0B',
        color: '#1A1A2E',
        borderRadius: '0.75rem',
        border: '1px solid #F3F4F6',
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.10)',
        fontSize: '0.875rem',
        padding: '12px 16px',
      },
      ...opts,
    }),
  info: (message, opts) =>
    hotToast(message, {
      icon: 'ℹ️',
      style: {
        background: '#ffffff',
        borderLeft: '3px solid #2D55FF',
        color: '#1A1A2E',
        borderRadius: '0.75rem',
        border: '1px solid #F3F4F6',
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.10)',
        fontSize: '0.875rem',
        padding: '12px 16px',
      },
      ...opts,
    }),
  promise: hotToast.promise,
  dismiss: hotToast.dismiss,
  loading: hotToast.loading,
};

export default toast;
