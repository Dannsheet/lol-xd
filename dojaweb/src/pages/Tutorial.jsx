import React from 'react';
import { useNavigate } from 'react-router-dom';

const Tutorial = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto w-full max-w-[520px] px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[16px] font-semibold">Tutorial</h1>
          <button
            type="button"
            className="text-[12px] text-white/70 hover:text-white"
            onClick={() => navigate('/dashboard')}
          >
            Volver
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4 text-[12px] text-white/80 space-y-2">
          <div>1) Regístrate y confirma tu correo.</div>
          <div>2) Vincula tu Binance en la sección Binance.</div>
          <div>3) Completa tareas / offerwalls (se integra después).</div>
          <div>4) Solicita tu retiro en Retirar.</div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
