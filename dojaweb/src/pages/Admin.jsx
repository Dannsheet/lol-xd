import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, Users } from 'lucide-react';
import { adminGetSummary, adminGetUserDetail, adminGetUserReferrals, adminGetUsers } from '../lib/api.js';

const Admin = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);

  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReferralsOpen, setSelectedReferralsOpen] = useState(false);
  const [selectedReferralsLoading, setSelectedReferralsLoading] = useState(false);
  const [selectedReferrals, setSelectedReferrals] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const loadSummary = useCallback(async () => {
    setError(null);
    const data = await adminGetSummary();
    setSummary(data || null);
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const resp = await adminGetUsers({ search: userSearch || undefined, limit: 200, offset: 0 });
      setUsers(Array.isArray(resp?.users) ? resp.users : []);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch]);

  const loadSelectedUser = useCallback(async (id) => {
    if (!id) return;
    setSelectedLoading(true);
    setSelectedReferralsOpen(false);
    setSelectedReferrals(null);
    try {
      const resp = await adminGetUserDetail(id);
      setSelectedUser(resp || null);
    } finally {
      setSelectedLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadSummary(), loadUsers()]);
    } catch (e) {
      console.error('[Admin] load error', e);
      setError(e?.message || 'No se pudo cargar el panel admin');
    } finally {
      setLoading(false);
    }
  }, [loadSummary, loadUsers]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const selectedTotals = selectedUser?.totals ?? null;
  const selectedTeam = selectedUser?.team ?? null;
  const selectedPlans = Array.isArray(selectedUser?.plans) ? selectedUser.plans : [];

  const teamSize = useMemo(() => {
    const niveles = Array.isArray(selectedTeam?.niveles) ? selectedTeam.niveles : [];
    return niveles.reduce((acc, n) => acc + (Number(n?.plantillaTotal ?? 0) || 0), 0);
  }, [selectedTeam]);

  const openReferrals = async () => {
    if (!selectedUserId) return;
    setSelectedReferralsOpen(true);
    if (selectedReferrals) return;
    setSelectedReferralsLoading(true);
    try {
      const resp = await adminGetUserReferrals(selectedUserId);
      setSelectedReferrals(resp || null);
    } catch (e) {
      showToast('error', e?.message || 'No se pudieron cargar los referidos');
      setSelectedReferrals(null);
    } finally {
      setSelectedReferralsLoading(false);
    }
  };

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

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-white/70">Panel general del sistema</div>
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

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="text-xs text-white/60">Usuarios</div>
          <div className="mt-2 text-2xl font-bold text-doja-cyan">{Number(summary?.users_count ?? 0)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="text-xs text-white/60">Monto recargado (total)</div>
          <div className="mt-2 text-2xl font-bold text-doja-cyan">{Number(summary?.deposits_total ?? 0).toFixed(2)} USDT</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="text-xs text-white/60">Ganancias (videos + referidos)</div>
          <div className="mt-2 text-2xl font-bold text-doja-cyan">{Number(summary?.earnings_total ?? 0).toFixed(2)} USDT</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="text-xs text-white/60">Retiros</div>
          <div className="mt-2 text-2xl font-bold text-doja-cyan">{Number(summary?.withdrawals_count ?? 0)}</div>
          <div className="mt-1 text-xs text-white/60">Monto: {Number(summary?.withdrawals_total ?? 0).toFixed(2)} USDT</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold inline-flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuarios
            </div>
            <div className="text-xs text-white/60">{usersLoading ? 'Cargando...' : `${users.length}`}</div>
          </div>

          <div className="mt-3">
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Buscar por correo"
              className="w-full rounded-xl bg-doja-bg/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-doja-cyan/50"
            />
            <button
              type="button"
              onClick={loadUsers}
              className="mt-3 w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 py-3 text-sm font-semibold transition"
              disabled={usersLoading}
            >
              {usersLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {usersLoading ? (
            <div className="mt-4 flex items-center justify-center text-white/60">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Cargando...
            </div>
          ) : users.length ? (
            <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl border border-white/10">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(u.id);
                    loadSelectedUser(u.id);
                  }}
                  className={
                    selectedUserId === u.id
                      ? 'w-full text-left px-4 py-3 border-b border-white/10 bg-white/10'
                      : 'w-full text-left px-4 py-3 border-b border-white/10 hover:bg-white/5'
                  }
                >
                  <div className="text-sm text-white/90 break-words">{u.email || u.id}</div>
                  <div className="mt-1 text-xs text-white/50 font-mono break-all">{u.id}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-sm text-white/60">No hay usuarios</div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-doja-dark/70 p-4">
          <div className="text-sm font-semibold">Detalle del usuario</div>

          {!selectedUserId ? (
            <div className="mt-3 text-sm text-white/60">Selecciona un usuario para ver detalles.</div>
          ) : selectedLoading ? (
            <div className="mt-4 flex items-center justify-center text-white/60">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Cargando...
            </div>
          ) : selectedUser?.user ? (
            <div className="mt-3">
              <div className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                <div className="text-sm text-white/90 break-words">{selectedUser.user.email || selectedUser.user.id}</div>
                <div className="mt-1 text-xs text-white/60 font-mono break-all">{selectedUser.user.id}</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  <div className="text-xs text-white/60">Generado (videos + referidos)</div>
                  <div className="mt-1 text-sm font-semibold text-doja-cyan">{Number(selectedTotals?.earnings_total ?? 0).toFixed(2)} USDT</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  <div className="text-xs text-white/60">Recargado</div>
                  <div className="mt-1 text-sm font-semibold text-doja-cyan">{Number(selectedTotals?.deposits_total ?? 0).toFixed(2)} USDT</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  <div className="text-xs text-white/60">Equipo (niveles 1-3)</div>
                  <div className="mt-1 text-sm font-semibold text-doja-cyan">{teamSize}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  <div className="text-xs text-white/60">Retiros</div>
                  <div className="mt-1 text-sm font-semibold text-doja-cyan">{Number(selectedTotals?.withdrawals_count ?? 0)}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-white/60">Planes comprados</div>
                {selectedPlans.length ? (
                  <div className="mt-2 space-y-2">
                    {selectedPlans.slice(0, 10).map((p, idx) => (
                      <div key={p.subscription_id || idx} className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                        <div className="text-sm text-white/90">{p.plan?.nombre || `Plan ${p.plan_id}`}</div>
                        <div className="mt-1 text-xs text-white/60 font-mono">precio: {Number(p.plan?.precio ?? 0).toFixed(2)} · activo: {String(Boolean(p.is_active))}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-white/60">Sin planes.</div>
                )}
              </div>

              <button
                type="button"
                onClick={openReferrals}
                className="mt-4 w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 py-3 text-sm font-semibold transition"
              >
                Ver referidos
              </button>

              {selectedReferralsOpen ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  {selectedReferralsLoading ? (
                    <div className="text-sm text-white/60">Cargando referidos...</div>
                  ) : selectedReferrals ? (
                    <div className="space-y-3">
                      {[{ title: 'Nivel 1', key: 'level1' }, { title: 'Nivel 2', key: 'level2' }, { title: 'Nivel 3', key: 'level3' }].map((sec) => {
                        const list = Array.isArray(selectedReferrals?.[sec.key]) ? selectedReferrals[sec.key] : [];
                        return (
                          <div key={sec.key}>
                            <div className="text-xs text-white/60">{sec.title} ({list.length})</div>
                            {list.length ? (
                              <div className="mt-2 space-y-2">
                                {list.slice(0, 30).map((m) => (
                                  <div key={m.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                    <div className="text-sm text-white/90 break-words">{m.email || m.id}</div>
                                    <div className="text-[11px] text-white/50 font-mono break-all">{m.id}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-1 text-sm text-white/60">Sin referidos</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-white/60">Sin datos.</div>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-3 text-sm text-white/60">No se pudo cargar el usuario.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
