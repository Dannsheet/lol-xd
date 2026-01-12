import React, { useMemo } from 'react';
import { Calendar, ChevronRight, QrCode } from 'lucide-react';
import './Promocion.css';

const Promocion = () => {
  const data = useMemo(
    () => ({
      totalIngresos: 0,
      ingresosHoy: 0,
      recargaTotal: 0,
      agregadoHoy: 0,
      niveles: [
        {
          nivel: 1,
          plantillaTotal: 0,
          numeroActivos: 0,
          equipoRecarga: 0,
          regresoTotal: 0,
          gananciasHoy: 0,
        },
        {
          nivel: 2,
          plantillaTotal: 0,
          numeroActivos: 0,
          equipoRecarga: 0,
          regresoTotal: 0,
          gananciasHoy: 0,
        },
        {
          nivel: 3,
          plantillaTotal: 0,
          numeroActivos: 0,
          equipoRecarga: 0,
          regresoTotal: 0,
          gananciasHoy: 0,
        },
      ],
    }),
    [],
  );

  const radio = 100;
  const circunferencia = 2 * Math.PI * radio;

  const pScore = 30;
  const pReco = 50;
  const pInv = 20;

  const segScore = (pScore / 100) * circunferencia;
  const segReco = (pReco / 100) * circunferencia;
  const segInv = (pInv / 100) * circunferencia;

  return (
    <div className="min-h-full bg-doja-bg text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promoción</h1>
        <button
          type="button"
          className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-white/10"
        >
          <QrCode className="w-5 h-5" />
          <span className="text-sm">Código QR</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-doja-dark/70 backdrop-blur border border-white/10 rounded-2xl p-4">
          <p className="text-white/70 text-sm mb-2">Ingresos totales del usuario</p>
          <p className="text-3xl font-bold text-doja-cyan">{data.totalIngresos.toFixed(2)}USDT</p>
        </div>
        <div className="bg-doja-dark/70 backdrop-blur border border-white/10 rounded-2xl p-4">
          <p className="text-white/70 text-sm mb-2">Ingresos añadidos hoy</p>
          <p className="text-3xl font-bold text-doja-cyan">{data.ingresosHoy.toFixed(2)}USDT</p>
        </div>
      </div>

      <div className="bg-doja-dark/70 backdrop-blur border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Análisis de beneficios</h2>

        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r={radio} stroke="#ff6b35" strokeWidth="56" fill="none" strokeDasharray={`${segScore} ${circunferencia}`} strokeDashoffset="0" />
              <circle cx="128" cy="128" r={radio} stroke="#6366f1" strokeWidth="56" fill="none" strokeDasharray={`${segReco} ${circunferencia}`} strokeDashoffset={-segScore} />
              <circle cx="128" cy="128" r={radio} stroke="#ec4899" strokeWidth="56" fill="none" strokeDasharray={`${segInv} ${circunferencia}`} strokeDashoffset={-(segScore + segReco)} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">0%</p>
                <p className="text-xs text-white/60">Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 w-full max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span className="text-sm">Ingresos por puntuación</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-indigo-500" />
              <span className="text-sm">Ingresos por recomendación</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-pink-500" />
              <span className="text-sm">Ingreso de inversión</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-full bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-4 flex items-center justify-between transition-all duration-200 mb-6"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5" />
          <span className="text-sm sm:text-base">Seleccionar fecha de consulta</span>
        </div>
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="bg-doja-dark/70 backdrop-blur border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold">Recarga total del equipo</h3>
          <span className="text-2xl font-bold text-doja-cyan">{data.recargaTotal} USDT</span>
        </div>
        <div className="text-sm text-white/60">
          <span>Agregado hoy: </span>
          <span className="text-white font-medium">{data.agregadoHoy}</span>
        </div>
      </div>

      {data.niveles.map((nivel) => (
        <div key={nivel.nivel} className="bg-doja-dark/70 backdrop-blur border border-white/10 rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold">Datos de nivel {nivel.nivel}</h3>
            <button type="button" className="flex items-center gap-2 text-white/60 hover:text-doja-light-cyan transition-colors">
              <span className="text-sm">Lista de miembros</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-doja-cyan">{nivel.plantillaTotal}</div>
              <div className="text-xs text-white/60 mt-1">Plantilla total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-doja-cyan">{nivel.numeroActivos}</div>
              <div className="text-xs text-white/60 mt-1">Número de Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-doja-cyan">{nivel.equipoRecarga}</div>
              <div className="text-xs text-white/60 mt-1">Equipo de recarga</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-doja-cyan">{nivel.regresoTotal}</div>
              <div className="text-xs text-white/60 mt-1">Regreso total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-doja-cyan">{nivel.gananciasHoy}</div>
              <div className="text-xs text-white/60 mt-1">Ganancias de hoy</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Promocion;
