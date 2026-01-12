import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-doja-bg text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-doja-dark/70 p-6">
        <h1 className="text-xl font-semibold">Página no disponible</h1>
        <p className="mt-2 text-sm text-white/70">
          Esta sección aún no está habilitada o la ruta no existe.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 py-3 text-sm font-medium transition"
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-doja-cyan/20 hover:bg-doja-cyan/30 border border-doja-cyan/40 py-3 text-sm font-semibold text-doja-cyan transition"
            onClick={() => navigate(session ? '/dashboard' : '/', { replace: true })}
          >
            {session ? 'Ir al dashboard' : 'Ir al inicio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
