import React from 'react';
import { Navigate } from 'react-router-dom';
import Auth from '../components/Auth/Auth';
import { useAuth } from '../hooks/useAuth';

const AuthPage = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        Cargando...
      </div>
    );
  }

  if (session) return <Navigate to="/dashboard" replace />;

  return <Auth />;
};

export default AuthPage;
