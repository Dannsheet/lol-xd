import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import './Promocion.css';

const useCountUp = (target, { durationMs = 900, decimals = 0 } = {}) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const to = Number(target || 0);
    if (!Number.isFinite(to)) {
      queueMicrotask(() => setValue(0));
      return undefined;
    }

    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = (ts) => {
      if (!startRef.current) {
        startRef.current = ts;
        setValue(0);
      }
      const p = Math.min(1, (ts - startRef.current) / durationMs);
      const eased = 1 - (1 - p) ** 3;
      const next = to * eased;
      setValue(next);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [durationMs, target]);

  const fixed = useMemo(() => {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return 0;
    const m = decimals > 0 ? Number(n.toFixed(decimals)) : Math.round(n);
    return Number.isFinite(m) ? m : 0;
  }, [decimals, value]);

  return fixed;
};

const NivelCard = ({ nivel, neonStyle }) => {
  const plantillaTotal = useCountUp(nivel?.plantillaTotal, { durationMs: 900, decimals: 0 });
  const numeroActivos = useCountUp(nivel?.numeroActivos, { durationMs: 900, decimals: 0 });
  const equipoRecarga = useCountUp(nivel?.equipoRecarga, { durationMs: 900, decimals: 0 });
  const regresoTotal = useCountUp(nivel?.regresoTotal, { durationMs: 900, decimals: 0 });
  const gananciasHoy = useCountUp(nivel?.gananciasHoy, { durationMs: 900, decimals: 0 });

  return (
    <div className="bg-doja-dark/70 backdrop-blur border border-white/10 rounded-2xl p-5 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">Datos de nivel {nivel.nivel}</h3>
        <button type="button" className="flex items-center gap-2 text-white/60 hover:text-doja-light-cyan transition-colors">
          <span className="text-sm">Lista de miembros</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold" style={neonStyle}>
            {plantillaTotal}
          </div>
          <div className="text-xs text-white/60 mt-1">Plantilla total</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={neonStyle}>
            {numeroActivos}
          </div>
          <div className="text-xs text-white/60 mt-1">Número de Activos</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={neonStyle}>
            {equipoRecarga}
          </div>
          <div className="text-xs text-white/60 mt-1">Equipo de recarga</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold" style={neonStyle}>
            {regresoTotal}
          </div>
          <div className="text-xs text-white/60 mt-1">Regreso total</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={neonStyle}>
            {gananciasHoy}
          </div>
          <div className="text-xs text-white/60 mt-1">Ganancias de hoy</div>
        </div>
      </div>
    </div>
  );
};

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

  const neonCyanStyle = useMemo(
    () => ({
      color: 'rgb(49, 241, 199)',
      textShadow: '0 0 12px rgba(49, 241, 199, 0.75), 0 0 38px rgba(49, 241, 199, 0.4)',
    }),
    [],
  );

  const totalIngresos = useCountUp(data.totalIngresos, { durationMs: 900, decimals: 2 });
  const ingresosHoy = useCountUp(data.ingresosHoy, { durationMs: 900, decimals: 2 });
  const recargaTotal = useCountUp(data.recargaTotal, { durationMs: 900, decimals: 2 });
  const agregadoHoy = useCountUp(data.agregadoHoy, { durationMs: 900, decimals: 2 });

  const radio = 100;
  const circunferencia = 2 * Math.PI * radio;

  const pScore = 30;
  const pReco = 50;
  const pInv = 20;

  const totalPct = useCountUp(100, { durationMs: 900, decimals: 0 });
  const scorePct = useCountUp(pScore, { durationMs: 1100, decimals: 0 });
  const recoPct = useCountUp(pReco, { durationMs: 1100, decimals: 0 });
  const invPct = useCountUp(pInv, { durationMs: 1100, decimals: 0 });

  const segScore = (Number(scorePct || 0) / 100) * circunferencia;
  const segReco = (Number(recoPct || 0) / 100) * circunferencia;
  const segInv = (Number(invPct || 0) / 100) * circunferencia;

  const ringStroke = 22;

  return (
    <div className="min-h-full bg-doja-bg text-white p-4">
      <div className="relative flex justify-between items-center mb-6 min-h-[32px]">
        <h1 className="pageTitleNeon absolute left-1/2 -translate-x-1/2 text-2xl font-bold">PROMOCIÓN</h1>
        <div />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-doja-dark/70 backdrop-blur border border-white/10 rounded-2xl p-4">
          <p className="text-white/70 text-sm mb-2">Ingresos totales del usuario</p>
          <p className="text-3xl font-bold" style={neonCyanStyle}>
            {Number(totalIngresos || 0).toFixed(2)} USDT
          </p>
        </div>
        <div className="bg-doja-dark/70 backdrop-blur border border-white/10 rounded-2xl p-4">
          <p className="text-white/70 text-sm mb-2">Ingresos añadidos hoy</p>
          <p className="text-3xl font-bold" style={neonCyanStyle}>
            {Number(ingresosHoy || 0).toFixed(2)} USDT
          </p>
        </div>
      </div>

      <div className="bg-doja-dark/70 backdrop-blur border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Análisis de beneficios</h2>

        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
              <circle
                cx="128"
                cy="128"
                r={radio}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={ringStroke}
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r={radio}
                stroke="#31f1c7"
                strokeWidth={ringStroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${segScore} ${circunferencia}`}
                strokeDashoffset="0"
                style={{ filter: 'drop-shadow(0 0 10px rgba(49, 241, 199, 0.75)) drop-shadow(0 0 28px rgba(49, 241, 199, 0.35))' }}
              />
              <circle
                cx="128"
                cy="128"
                r={radio}
                stroke="rgba(139, 92, 246, 0.95)"
                strokeWidth={ringStroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${segReco} ${circunferencia}`}
                strokeDashoffset={-segScore}
                style={{ filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.75)) drop-shadow(0 0 28px rgba(139, 92, 246, 0.35))' }}
              />
              <circle
                cx="128"
                cy="128"
                r={radio}
                stroke="#ec4899"
                strokeWidth={ringStroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${segInv} ${circunferencia}`}
                strokeDashoffset={-(segScore + segReco)}
                style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.75)) drop-shadow(0 0 28px rgba(236, 72, 153, 0.35))' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold" style={neonCyanStyle}>
                  {totalPct}%
                </p>
                <p className="text-xs text-white/60">Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 w-full max-w-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-indigo-500" />
                <span className="text-sm">Ingresos por recomendación</span>
              </div>
              <span className="text-sm font-bold" style={neonCyanStyle}>
                {recoPct}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-orange-500" />
                <span className="text-sm">Ingresos por puntuación</span>
              </div>
              <span className="text-sm font-bold" style={neonCyanStyle}>
                {scorePct}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-pink-500" />
                <span className="text-sm">Ingreso de inversión</span>
              </div>
              <span className="text-sm font-bold" style={neonCyanStyle}>
                {invPct}%
              </span>
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
          <span className="text-2xl font-bold" style={neonCyanStyle}>
            {Number(recargaTotal || 0).toFixed(2)} USDT
          </span>
        </div>
        <div className="text-sm text-white/60">
          <span>Agregado hoy: </span>
          <span className="font-semibold" style={neonCyanStyle}>
            {Number(agregadoHoy || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {data.niveles.map((nivel) => (
        <NivelCard key={nivel.nivel} nivel={nivel} neonStyle={neonCyanStyle} />
      ))}
    </div>
  );
};

export default Promocion;
