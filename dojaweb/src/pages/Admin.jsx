import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Admin = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [pendingPayments, setPendingPayments] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [plansById, setPlansById] = useState({});

  const [metrics, setMetrics] = useState({
    pending: 0,
    confirmed: 0,
    activeSubs: 0,
    confirmedAmount: 0,
  });

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const loadPaymentsAndLookups = useCallback(async () => {
    setError(null);

    const { data: pagos, error: pagosError } = await supabase
      .from('pagos')
      .select('id,usuario_id,plan_id,monto,metodo,estado,creado_en')
      .eq('estado', 'pendiente')
      .order('creado_en', { ascending: false })
      .limit(100);

    if (pagosError) throw pagosError;

    const rows = Array.isArray(pagos) ? pagos : [];
    setPendingPayments(rows);

    const userIds = Array.from(new Set(rows.map((r) => r.usuario_id).filter(Boolean)));
    const planIds = Array.from(new Set(rows.map((r) => r.plan_id).filter((v) => v != null)));

    if (userIds.length) {
      const { data: usuarios, error: usuariosError } = await supabase.from('usuarios').select('id,email').in('id', userIds);
      if (usuariosError) throw usuariosError;
      const map = {};
      (usuarios || []).forEach((u) => {
        map[u.id] = u;
      });
      setUsersById(map);
    } else {
      setUsersById({});
    }

    if (planIds.length) {
      const { data: planes, error: planesError } = await supabase.from('planes').select('id,nombre,precio').in('id', planIds);
      if (planesError) throw planesError;
      const map = {};
      (planes || []).forEach((p) => {
        map[p.id] = p;
      });
      setPlansById(map);
    } else {
      setPlansById({});
    }
  }, []);

  const loadMetrics = useCallback(async () => {
    const [{ count: pendingCount, error: pendingErr }, { count: confirmedCount, error: confirmedErr }, { count: subsCount, error: subsErr }] =
      await Promise.all([
        supabase.from('pagos').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('pagos').select('id', { count: 'exact', head: true }).eq('estado', 'confirmado'),
        supabase.from('suscripciones').select('id', { count: 'exact', head: true }).eq('estado', 'activa'),
      ]);

    if (pendingErr) throw pendingErr;
    if (confirmedErr) throw confirmedErr;
    if (subsErr) throw subsErr;

    const { data: confirmedRows, error: confirmedRowsErr } = await supabase
      .from('pagos')
      .select('monto')
      .eq('estado', 'confirmado')
      .order('creado_en', { ascending: false })
      .limit(500);

    if (confirmedRowsErr) throw confirmedRowsErr;

    const total = (confirmedRows || []).reduce((acc, r) => acc + Number(r?.monto || 0), 0);

    setMetrics({
      pending: Number(pendingCount || 0),
      confirmed: Number(confirmedCount || 0),
      activeSubs: Number(subsCount || 0),
      confirmedAmount: total,
    });
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadPaymentsAndLookups(), loadMetrics()]);
    } catch (e) {
      console.error('[Admin] load error', e);
      setError(e?.message || 'No se pudo cargar el panel admin');
    } finally {
      setLoading(false);
    }
  }, [loadMetrics, loadPaymentsAndLookups]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const updatePagoEstado = async (pagoId, nextEstado) => {
    setActionLoadingId(pagoId);
    try {
      const { error: updErr } = await supabase.from('pagos').update({ estado: nextEstado }).eq('id', pagoId);
      if (updErr) throw updErr;
      showToast('success', `Pago actualizado a ${nextEstado}.`);
      await loadAll();
    } catch (e) {
      console.error('[Admin] update pago error', e);
      showToast('error', e?.message || 'No se pudo actualizar el pago');
    } finally {
      setActionLoadingId(null);
    }
  };

  const rows = useMemo(() => {
    return pendingPayments.map((p) => {
      const u = usersById?.[p.usuario_id];
      const pl = plansById?.[p.plan_id];
      return {
        ...p,
        userEmail: u?.email || '',
        planName: pl?.nombre || String(p.plan_id ?? ''),
      };
    });
  }, [pendingPayments, plansById, usersById]);

  return (
    <div className="min-h-screen bg-doja-bg text-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <button
          type="button"
          className="text-sm text-white/60 hover:text-doja-light-cyan transition"
          onClick={() => navigate('/dashboard')}
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

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="text-sm font-semibold text-red-400">Error</div>
          <div className="mt-2 text-xs text-white/70 font-mono break-words">{error}</div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="text-xs text-white/60">Pagos pendientes</div>
          <div className="mt-2 text-2xl font-bold text-doja-cyan">{metrics.pending}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="text-xs text-white/60">Pagos confirmados</div>
          <div className="mt-2 text-2xl font-bold text-doja-cyan">{metrics.confirmed}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="text-xs text-white/60">Suscripciones activas</div>
          <div className="mt-2 text-2xl font-bold text-doja-cyan">{metrics.activeSubs}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="text-xs text-white/60">Total confirmado (últimos 500)</div>
          <div className="mt-2 text-2xl font-bold text-doja-cyan">{metrics.confirmedAmount.toFixed(2)} USDT</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Pagos pendientes</div>
            <div className="mt-1 text-xs text-white/60">Confirma o rechaza pagos para activar suscripciones automáticamente.</div>
          </div>
          <button
            type="button"
            className="rounded-xl px-3 py-2 text-sm font-semibold transition border bg-doja-cyan/20 hover:bg-doja-cyan/30 border-doja-cyan/40 text-doja-cyan flex items-center gap-2"
            onClick={loadAll}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center text-white/60">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Cargando...
          </div>
        ) : rows.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/60">
                  <th className="py-2 pr-4">Usuario</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Monto</th>
                  <th className="py-2 pr-4">Método</th>
                  <th className="py-2 pr-4">Creado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const isActing = actionLoadingId === p.id;
                  return (
                    <tr key={p.id} className="border-t border-white/10">
                      <td className="py-3 pr-4">
                        <div className="text-white/90 break-words">{p.userEmail || p.usuario_id}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-white/90">{p.planName}</div>
                        <div className="text-xs text-white/40">ID: {p.plan_id}</div>
                      </td>
                      <td className="py-3 pr-4 font-mono">{Number(p.monto || 0).toFixed(2)}</td>
                      <td className="py-3 pr-4 font-mono text-white/70">{p.metodo}</td>
                      <td className="py-3 pr-4 text-white/70">{p.creado_en ? new Date(p.creado_en).toLocaleString() : '—'}</td>
                      <td className="py-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => updatePagoEstado(p.id, 'confirmado')}
                            className="rounded-xl px-3 py-2 text-sm font-semibold transition border bg-doja-cyan/20 hover:bg-doja-cyan/30 border-doja-cyan/40 text-doja-cyan flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirmar
                          </button>
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => updatePagoEstado(p.id, 'rechazado')}
                            className="rounded-xl px-3 py-2 text-sm font-semibold transition border bg-white/5 hover:bg-white/10 border-white/10 text-white/80 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 text-sm text-white/60">No hay pagos pendientes.</div>
        )}
      </div>
    </div>
  );
};

export default Admin;
