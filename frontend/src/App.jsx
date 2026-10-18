import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PreloaderProvider } from './context/PreloaderProvider';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PreloaderProvider>
          <AppRoutes />
        </PreloaderProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
