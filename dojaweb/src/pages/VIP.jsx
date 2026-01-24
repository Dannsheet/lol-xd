import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Crown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { buyVip, createVipIntent, getCuentaInfo, getMyPlan, getMyPlans, getVideosStatus } from '../lib/api.js';
import './VIP.css';

const VIP = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [activeSubs, setActiveSubs] = useState([]);
  const [activePlanIds, setActivePlanIds] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buyingPlanId, setBuyingPlanId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = useCallback((type, message) => setToast({ type, message }), []);

  const activeSubsView = useMemo(() => {
    const src = Array.isArray(activeSubs) && activeSubs.length ? activeSubs : activeSub?.plan_id ? [activeSub] : [];
    const rows = src
      .map((s) => {
        const raw = s?.expira_en || s?.expires_at || s?.vence_en || s?.expiresAt || null;
        const d = raw ? new Date(raw) : null;
        const expiryMs = d && Number.isFinite(d.getTime()) ? d.getTime() : null;
        return {
          subscription_id: s?.subscription_id ?? s?.id ?? null,
          plan_id: s?.plan_id ?? s?.plan?.id ?? null,
          nombre: s?.nombre ?? s?.plan?.nombre ?? s?.plan?.name ?? null,
          expira_en: raw,
          expiryMs,
        };
      })
      .filter((r) => r?.plan_id != null);

    rows.sort((a, b) => {
      const at = a?.expiryMs ?? Number.POSITIVE_INFINITY;
      const bt = b?.expiryMs ?? Number.POSITIVE_INFINITY;
      return at - bt;
    });

    return rows;
  }, [activeSub, activeSubs]);

  useEffect(() => {
    if (!activeSubsView.length) return;
    setNowTs(Date.now());
    const id = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeSubsView.length]);

  const countdownFor = useCallback(
    (expiryMs) => {
      if (!Number.isFinite(Number(expiryMs))) return null;
      const diffMs = Math.max(0, Number(expiryMs) - Number(nowTs || 0));
      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      return { days, hours, minutes, diffMs };
    },
    [nowTs],
  );

  const vipDailyByLevel = useMemo(
    () => ({
      1: { price: 10, daily: 0.5 },
      2: { price: 20, daily: 1 },
      3: { price: 50, daily: 2.4 },
      4: { price: 200, daily: 9.5 },
      5: { price: 400, daily: 20 },
      6: { price: 600, daily: 31 },
      7: { price: 1200, daily: 62 },
      8: { price: 3000, daily: 150 },
      9: { price: 6000, daily: 300 },
    }),
    [],
  );

  const getVipLevel = (plan) => {
    const raw = String(plan?.nombre || '');
    const m = raw.match(/vip\s*(\d+)/i);
    const n = m ? Number(m[1]) : null;
    return Number.isFinite(n) ? n : null;
  };

  const loadVipData = useCallback(async () => {
    if (!user) {
      setPlans([]);
      setActiveSub(null);
      setActiveSubs([]);
      setActivePlanIds([]);
      setBalance(0);
      setLoadError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const { data: planesData, error: planesError } = await supabase
        .from('planes')
        .select('id,nombre,precio,limite_tareas,ganancia_diaria')
        .order('id', { ascending: true });

      if (planesError) throw planesError;

      setPlans(Array.isArray(planesData) ? planesData : []);

      const cuenta = await getCuentaInfo();
      const nextBalance = Number(cuenta?.balance || 0);
      setBalance(Number.isFinite(nextBalance) ? nextBalance : 0);

      try {
        const myPlansResp = await getMyPlans();
        const planes = Array.isArray(myPlansResp?.planes) ? myPlansResp.planes : [];
        setActiveSubs(planes);

        if (planes.length) {
          setActiveSub(planes[0] || null);
        } else {
          const miPlan = await getMyPlan();
          setActiveSub(miPlan || null);
        }
      } catch (e) {
        const msg = String(e?.message || '');
        const lower = msg.toLowerCase();
        if (e?.status === 404 || lower.includes('sin suscripción activa') || lower.includes('sin suscripcion activa')) {
          setActiveSub(null);
          setActiveSubs([]);
        } else {
          throw e;
        }
      }

      try {
        const status = await getVideosStatus();
        const ids = Array.isArray(status?.planes)
          ? status.planes
              .map((p) => Number(p?.plan_id))
              .filter((id) => Number.isFinite(id))
          : [];
        setActivePlanIds(Array.from(new Set(ids)));
      } catch {
        const fallbackIds = Array.isArray(activeSubs)
          ? activeSubs
              .map((s) => Number(s?.plan_id))
              .filter((id) => Number.isFinite(id))
          : [];
        setActivePlanIds(Array.from(new Set(fallbackIds)));
      }
    } catch (e) {
      console.error('[VIP] load error', e);
      const msg = e?.message || 'No se pudo cargar VIP';
      setLoadError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    if (authLoading) return;
    loadVipData();
  }, [authLoading, loadVipData]);

  const handleBuy = async (plan) => {
    if (!user) {
      showToast('error', 'Debes iniciar sesión.');
      return;
    }
    const planId = Number(plan?.id);
    if (Number.isFinite(planId) && activePlanIds.includes(planId)) {
      showToast('error', 'Ya tienes este plan activo.');
      return;
    }
    if (Array.isArray(activePlanIds) && activePlanIds.length >= 8) {
      showToast('error', 'Límite alcanzado: máximo 8 planes activos.');
      return;
    }
    const price = Number(plan?.precio || 0);
    if (Number(balance || 0) < price) {
      showToast('error', 'Saldo insuficiente. Recarga tu billetera para comprar este plan.');
      try {
        await createVipIntent(plan.id);
      } catch (e) {
        console.error('[VIP] create intent error', e);
      }
      navigate('/wallet', { state: { vipPlanId: plan.id } });
      return;
    }

    setBuyingPlanId(plan.id);
    try {
      const resp = await buyVip(plan.id);
      const nbRaw = resp?.newBalance ?? resp?.new_balance;
      if (nbRaw != null) {
        const nb = Number(nbRaw);
        setBalance(Number.isFinite(nb) ? nb : balance);
      }
      showToast('success', resp?.message || 'Plan activado');
      await loadVipData();
    } catch (e) {
      console.error('[VIP] buy error', e);
      showToast('error', e?.message || 'No se pudo activar el plan');
    } finally {
      setBuyingPlanId(null);
    }
  };

  return (
    <div className="min-h-full bg-doja-bg text-white p-4">
      <div className="relative flex items-center justify-between min-h-[32px]">
        <h1 className="pageTitleNeon absolute left-1/2 -translate-x-1/2 text-2xl font-bold">VIP</h1>
        <div className="flex items-center gap-3">
          <div className="vipStatusPill" aria-label="Estado de suscripción">
            <span className="vipStatusPill__text">
              {activePlanIds?.length
                ? `VIP Activo (${activePlanIds.length})`
                : activeSub?.plan_id
                  ? String(activeSub?.nombre || activeSub?.plan_id)
                  : 'Cuenta gratis'}
            </span>
          </div>
          <button
            type="button"
            className="text-sm text-white/60 hover:text-doja-light-cyan transition"
            onClick={() => navigate('/dashboard')}
          >
            Volver
          </button>
        </div>
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

      {loadError && !loading && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="text-sm font-semibold text-red-400">Error cargando VIP</div>
          <div className="mt-2 text-xs text-white/70 font-mono break-words">{loadError}</div>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/70">Balance</div>
          <div className="text-lg font-semibold text-doja-cyan">{Number(balance || 0).toFixed(2)} USDT</div>
        </div>
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 py-3 text-sm font-semibold transition"
          onClick={() => navigate('/wallet')}
        >
          Recargar
        </button>
      </div>

      {activeSubsView.length ? (
        <div className="mt-4 rounded-2xl border border-doja-cyan/30 bg-doja-cyan/10 p-4">
          <div className="mt-3 flex items-center gap-2 text-doja-cyan font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Suscripción activa
          </div>

          <div className="mt-3 space-y-3">
            {activeSubsView.map((s) => {
              const cd = countdownFor(s?.expiryMs);
              const expiryLabel = (() => {
                if (!s?.expira_en) return '—';
                const d = new Date(String(s.expira_en));
                return Number.isFinite(d.getTime()) ? d.toLocaleString() : String(s.expira_en);
              })();

              return (
                <div key={s?.subscription_id || s?.plan_id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-white/70">Plan</div>
                      <div className="text-sm font-semibold text-white">
                        <span className="font-mono">{s?.nombre || `#${s?.plan_id}`}</span>
                      </div>
                      <div className="mt-1 text-xs text-white/60">Expira: {expiryLabel}</div>
                    </div>
                    {cd ? (
                      <div className="text-right">
                        <div className="text-[11px] text-white/60">Termina en</div>
                        <div className="mt-1 text-sm font-extrabold text-doja-cyan">
                          {cd.days}d {String(cd.hours).padStart(2, '0')}h {String(cd.minutes).padStart(2, '0')}m
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="text-sm text-white/70">Planes disponibles</div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center text-white/60">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Cargando...
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4">
            {!loadError && plans.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4 text-sm text-white/70">
                No hay planes disponibles para mostrar.
              </div>
            )}
            {plans.map((plan) => {
              const level = getVipLevel(plan);
              const meta = level ? vipDailyByLevel[level] : null;
              const price = Number(plan?.precio || meta?.price || 0);
              const daily = Number.isFinite(Number(plan?.ganancia_diaria)) ? Number(plan?.ganancia_diaria) : meta?.daily;
              const isBuying = buyingPlanId === plan.id;
              const planId = Number(plan?.id);
              const alreadyActive = Number.isFinite(planId) && Array.isArray(activePlanIds) && activePlanIds.includes(planId);
              const maxReached = Array.isArray(activePlanIds) && activePlanIds.length >= 8;
              const isDisabled = Boolean(isBuying || alreadyActive || maxReached);

              return (
                <div key={plan.id} className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleBuy(plan)}
                    className={
                      'w-full rounded-xl py-3 text-sm font-extrabold transition ' +
                      (alreadyActive || maxReached
                        ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-[rgba(139,92,246,0.95)] text-white shadow-[0_0_18px_rgba(139,92,246,0.65),0_0_48px_rgba(139,92,246,0.35)] hover:bg-[rgba(139,92,246,1)] hover:shadow-[0_0_26px_rgba(139,92,246,0.85),0_0_62px_rgba(139,92,246,0.45)]')
                    }
                  >
                    {isBuying ? 'Procesando...' : alreadyActive ? 'Activo' : maxReached ? 'Límite alcanzado' : 'Suscribirse'}
                  </button>

                  <div className="mt-3 text-center text-[12px] text-white/70">
                    Compra para recibir las siguientes ganancias
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5 text-doja-cyan" />
                    <div className="text-lg font-semibold">{plan.nombre}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <div className="text-[11px] text-white/60">Precio</div>
                      <div className="mt-1 text-base font-extrabold text-doja-cyan">${Number(price).toFixed(2)}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <div className="text-[11px] text-white/60">Ganancia diaria</div>
                      <div className="mt-1 text-base font-extrabold text-doja-cyan">
                        {typeof daily === 'number' ? `$${daily}` : '—'}
                      </div>
                    </div>
                  </div>

                  {plan?.limite_tareas != null ? (
                    <div className="mt-3 text-center text-xs text-white/60">
                      Límite de tareas: {plan.limite_tareas}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VIP;
