import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: '#333',
          border: '1px solid #e5e7eb',
        },
        className: 'font-sans',
      }}
      richColors
    />
  );
};
