import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Headset, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCuentaInfo } from '../lib/api.js';
import './Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [saldo, setSaldo] = useState(0);
  const [totalGanado, setTotalGanado] = useState(0);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const inviteCode = useMemo(() => {
    const raw =
      user?.user_metadata?.invite_code ||
      user?.user_metadata?.ref_code ||
      user?.user_metadata?.referral_code ||
      user?.user_metadata?.codigo_invitacion ||
      user?.user_metadata?.invitation_code ||
      '';

    const clean = String(raw || '').trim();
    if (clean) return clean;

    const seed = String(user?.id || user?.email || '');
    if (!seed) return '';

    let h = 0;
    for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 1000000;
    return String(h).padStart(6, '0');
  }, [user?.email, user?.id, user?.user_metadata]);

  const handleCopy = useCallback(
    async (value) => {
      try {
        await navigator.clipboard.writeText(String(value || ''));
        showToast('success', 'Copiado');
      } catch {
        showToast('error', 'No se pudo copiar');
      }
    },
    [showToast],
  );

  const loadCuenta = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const cuenta = await getCuentaInfo();
      const nextSaldo = Number(cuenta?.balance ?? cuenta?.saldo_interno ?? 0);
      const nextTotal = Number(cuenta?.total_ganado ?? cuenta?.totalGanado ?? 0);
      setSaldo(Number.isFinite(nextSaldo) ? nextSaldo : 0);
      setTotalGanado(Number.isFinite(nextTotal) ? nextTotal : 0);
    } catch {
      setSaldo(0);
      setTotalGanado(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCuenta();
  }, [loadCuenta]);

  const metrics = useMemo(
    () => [
      { label: 'Billetera electrónica (USDT)', value: saldo.toFixed(2) },
      { label: 'Cartera flexible (USDT)', value: '0.00' },
      { label: 'Desbloquear congelamiento (USDT)', value: '0.00' },
      { label: 'Ingresos totales (USDT)', value: String(totalGanado || 0) },
      { label: 'Ingresos totales por comisiones', value: '0' },
      { label: 'Recarga acumulada (USDT)', value: '0.00' },
      { label: 'Retiro acumulativo (USDT)', value: '0' },
      { label: 'Tamaño total del equipo', value: '0' },
    ],
    [saldo, totalGanado],
  );

  return (
    <div className="min-h-full bg-doja-bg text-white p-4">
      <div className="relative flex items-center justify-between min-h-[32px]">
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">A mi</h1>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-sm text-white/60 hover:text-doja-light-cyan transition"
        >
          Volver
        </button>
      </div>

      {toast && (
        <div
          className="mt-4 px-4 py-3 rounded-xl border text-sm font-medium"
          style={{
            borderColor: toast.type === 'error' ? '#ff4d4f' : '#8B5CF6',
            backgroundColor: toast.type === 'error' ? 'rgba(255, 77, 79, 0.1)' : 'rgba(139, 92, 246, 0.1)',
            color: toast.type === 'error' ? '#ff4d4f' : '#8B5CF6',
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-white/60">Cuenta</div>
            <div className="text-sm font-semibold break-all">{user?.email || user?.phone || '—'}</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-white/60">Código de invitación</div>
            <div className="flex items-center justify-end gap-2">
              <div className="text-sm font-semibold">{inviteCode || '—'}</div>
              <button
                type="button"
                onClick={() => handleCopy(inviteCode)}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 hover:text-white hover:bg-white/10 transition"
                aria-label="Copiar código"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[12px] text-white/60 leading-tight">{m.label}</div>
            <div className="mt-2 text-lg font-semibold" style={{ color: '#31f1c7' }}>
              {loading ? '—' : m.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition"
          onClick={() => showToast('success', 'Centro de ayuda: próximamente')}
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-white/70" />
            <div className="text-sm font-semibold">Centro de ayuda</div>
          </div>
          <div className="text-white/40">›</div>
        </button>
        <div className="h-px bg-white/10" />
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition"
          onClick={() => showToast('success', 'Servicio al cliente: próximamente')}
        >
          <div className="flex items-center gap-3">
            <Headset className="w-5 h-5 text-white/70" />
            <div className="text-sm font-semibold">Contactar servicio al cliente</div>
          </div>
          <div className="text-white/40">›</div>
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
};

export default Perfil;
