import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Headset, HelpCircle, Send, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCuentaInfo, getMyReferralProfile, getMyReferralStats } from '../lib/api.js';
import './Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [saldo, setSaldo] = useState(0);
  const [totalGanado, setTotalGanado] = useState(0);
  const [totalComisiones, setTotalComisiones] = useState(0);
  const [comisionesError, setComisionesError] = useState('');
  const [serverInviteCode, setServerInviteCode] = useState('');
  const [inviteCodeLoading, setInviteCodeLoading] = useState(true);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        setInviteCodeLoading(true);
        const resp = await getMyReferralProfile();
        const code = String(resp?.invite_code || resp?.inviteCode || '').trim();
        if (alive && code) setServerInviteCode(code);
      } catch {
        // ignore
      } finally {
        if (alive) setInviteCodeLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const openExternal = useCallback((url) => {
    try {
      window.open(String(url), '_blank', 'noreferrer');
    } catch {
      // ignore
    }
  }, []);

  const inviteCode = useMemo(() => (serverInviteCode ? serverInviteCode : ''), [serverInviteCode]);

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

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const resp = await getMyReferralStats();
        const v = Number(resp?.totalIngresos ?? 0);
        if (!alive) return;
        setComisionesError('');
        setTotalComisiones(Number.isFinite(v) ? v : 0);
      } catch (e) {
        if (!alive) return;
        setTotalComisiones(0);
        setComisionesError(String(e?.message || 'No se pudieron cargar las comisiones'));
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, []);

  const metrics = useMemo(
    () => {
      const baseTotalGanado = Number(totalGanado || 0);
      const baseTotalComisiones = Number(totalComisiones || 0);
      const gananciasTotales =
        (Number.isFinite(baseTotalGanado) ? baseTotalGanado : 0) +
        (Number.isFinite(baseTotalComisiones) ? baseTotalComisiones : 0);

      return [
        { label: 'Recarga acumulada (USDT)', value: saldo.toFixed(2) },
        { label: 'Ganancias totales (USDT)', value: Number(gananciasTotales || 0).toFixed(2) },
        { label: 'Desbloquear congelamiento (USDT)', value: '0.00' },
        { label: 'Ingresos totales (USDT)', value: (Number.isFinite(baseTotalGanado) ? baseTotalGanado : 0).toFixed(2) },
        { label: 'Ingresos totales por comisiones', value: (Number.isFinite(baseTotalComisiones) ? baseTotalComisiones : 0).toFixed(2) },
        { label: 'Retiro acumulativo (USDT)', value: '0' },
        { label: 'Tamaño total del equipo', value: '0' },
      ];
    },
    [saldo, totalComisiones, totalGanado],
  );

  const neonCyanStyle = useMemo(
    () => ({
      color: 'rgb(49, 241, 199)',
      textShadow: '0 0 12px rgba(49, 241, 199, 0.75), 0 0 38px rgba(49, 241, 199, 0.4)',
    }),
    [],
  );

  return (
    <div className="min-h-full bg-doja-bg text-white p-4">
      <div className="relative flex items-center justify-between min-h-[32px]">
        <h1 className="pageTitleNeon absolute left-1/2 -translate-x-1/2 text-2xl font-bold">PERFIL</h1>
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
              <div className="text-sm font-semibold">{inviteCodeLoading ? '—' : inviteCode || '—'}</div>
              <button
                type="button"
                onClick={() => handleCopy(inviteCode)}
                disabled={inviteCodeLoading || !inviteCode}
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

      {comisionesError ? (
        <div className="mt-4 px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-200">
          {comisionesError}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[12px] text-white/60 leading-tight">{m.label}</div>
            <div className="mt-2 text-lg font-semibold" style={neonCyanStyle}>
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

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-4">
          <div className="text-sm font-semibold">Soporte</div>
          <div className="mt-1 text-xs text-white/60">Telegram de soporte: t.me/dajoweb</div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => openExternal('https://t.me/dajoweb')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              <Headset className="w-4 h-4" />
              Abrir soporte
            </button>
            <button
              type="button"
              onClick={() => handleCopy('https://t.me/dajoweb')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>
          </div>
        </div>

        <div className="h-px bg-white/10" />
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition"
          onClick={() => openExternal('https://t.me/canaldajoweb')}
        >
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-white/70" />
            <div className="text-sm font-semibold">Canal de Telegram</div>
          </div>
          <div className="text-white/40">›</div>
        </button>
        <div className="h-px bg-white/10" />
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition"
          onClick={() => openExternal('https://t.me/DajoWebGrupo')}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-white/70" />
            <div className="text-sm font-semibold">Grupo de Telegram</div>
          </div>
          <div className="text-white/40">›</div>
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
};

export default Perfil;
