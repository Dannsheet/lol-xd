import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = () => {
  const { session, user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!session || !user) {
        if (mounted) setChecking(false);
        return;
      }

      setChecking(true);
      setError(null);
      try {
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [session, user]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        Cargando...
      </div>
    );
  }

  if (!session) return <Navigate to="/" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-doja-bg text-white p-4">
        <h1 className="text-2xl font-bold">Acceso restringido</h1>
        <div className="mt-4 text-white/70">
          No tienes permisos de administrador.
        </div>
        {error ? <div className="mt-2 text-xs text-white/50 font-mono break-words">{error}</div> : null}
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
