import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, QrCode, RefreshCw, Send, Wallet as WalletIcon } from 'lucide-react';
import {
  createDepositRequest,
  getCuentaInfo,
  withdrawCreate,
  withdrawValidate,
} from '../lib/api.js';

const WalletPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [saldoInterno, setSaldoInterno] = useState(0);
  const [totalGanado, setTotalGanado] = useState(null);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState(null);

  const [depositLoading, setDepositLoading] = useState(false);
  const [deposit, setDeposit] = useState(null);
  const [confirmDepositLoading, setConfirmDepositLoading] = useState(false);

  const [pollingActive, setPollingActive] = useState(false);

  const lastBalanceRef = useRef(0);

  const depositNetwork = useMemo(() => {
    if (!deposit) return '';
    return String(deposit?.red || deposit?.network || deposit?.chain || deposit?.network_name || '').trim();
  }, [deposit]);

  const depositAddress = useMemo(() => {
    if (!deposit) return '';
    return String(deposit?.direccion || deposit?.address || deposit?.wallet_address || '').trim();
  }, [deposit]);

  const depositQrValue = useMemo(() => {
    if (!depositAddress) return '';
    const raw = String(depositNetwork || '').trim().toUpperCase();
    const scheme = raw ? raw.split('-')[0].toLowerCase() : 'bep20';
    return `${scheme}:${depositAddress}?token=USDT`;
  }, [depositAddress, depositNetwork]);

  const depositMemo = useMemo(() => {
    if (!deposit) return '';
    return String(deposit?.memo || deposit?.tag || deposit?.memo_tag || '').trim();
  }, [deposit]);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawValidated, setWithdrawValidated] = useState(null);
  const [withdrawCreated, setWithdrawCreated] = useState(null);
  const [withdrawForm, setWithdrawForm] = useState({ monto: '', red: 'BEP20-USDT', direccion: '', pin: '' });

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = useCallback((type, message) => setToast({ type, message }), []);

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

  const shouldOpenWithdrawFromNav = useMemo(() => Boolean(location?.state?.openWithdraw), [location?.state]);

  useEffect(() => {
    if (!shouldOpenWithdrawFromNav) return;
    setWithdrawOpen(true);
  }, [shouldOpenWithdrawFromNav]);

  const loadCuenta = useCallback(async () => {
    setLoading(true);
    setHistoryLoading(true);
    try {
      const data = await getCuentaInfo();
      const next = Number(data?.balance || 0);
      setSaldoInterno(Number.isFinite(next) ? next : 0);
      const tg = Number(data?.total_ganado);
      setTotalGanado(Number.isFinite(tg) ? tg : null);
      setHistory(data?.movimientos_recientes ?? null);

      return {
        balance: Number.isFinite(next) ? next : 0,
      };
    } catch (e) {
      console.error('[Wallet] /cuenta/info error', e);
      showToast('error', e?.message || 'No se pudo cargar tu cuenta');
      setSaldoInterno(0);
      setTotalGanado(null);
      setHistory(null);
      return null;
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCuenta();
  }, [loadCuenta]);

  useEffect(() => {
    lastBalanceRef.current = Number(saldoInterno || 0);
  }, [saldoInterno]);

  const balanceNumber = useMemo(() => Number(saldoInterno || 0), [saldoInterno]);
  const formattedBalance = useMemo(() => Number(saldoInterno || 0).toFixed(2), [saldoInterno]);

  const totalGanadoNumber = useMemo(() => {
    if (Number.isFinite(Number(totalGanado))) return Number(totalGanado);

    const items = Array.isArray(history) ? history : [];
    return items.reduce((acc, m) => {
      const tipo = String(m?.tipo || '').toLowerCase();
      const monto = Number(m?.monto || 0);
      if (!Number.isFinite(monto) || monto <= 0) return acc;
      if (['deposito', 'depósito', 'deposit'].includes(tipo)) return acc;
      return acc + monto;
    }, 0);
  }, [history, totalGanado]);

  const formattedGanado = useMemo(() => totalGanadoNumber.toFixed(2), [totalGanadoNumber]);
  const estado = useMemo(() => '—', []);

  const isCuentaActiva = useMemo(() => true, []);

  const openWithdraw = () => {
    if (!isCuentaActiva) {
      showToast('error', 'Tu cuenta no está activa');
      return;
    }
    if (!(balanceNumber >= 10)) {
      showToast('error', 'El retiro mínimo es 10 USDT');
      return;
    }
    setWithdrawOpen(true);
    setWithdrawValidated(null);
    setWithdrawCreated(null);
  };

  const closeWithdraw = () => {
    setWithdrawOpen(false);
    setWithdrawLoading(false);
  };

  const handleCreateDepositAddress = async () => {
    setDepositLoading(true);
    try {
      lastBalanceRef.current = Number(saldoInterno || 0);
      const data = await createDepositRequest({ currency: 'USDT' });
      const raw = data?.data || data;
      const normalized = raw
        ? {
            ...raw,
            red: String(raw?.red || raw?.network || raw?.chain || raw?.network_name || raw?.currency || 'USDT').trim(),
            direccion: String(raw?.payment_address || raw?.direccion || raw?.address || raw?.wallet_address || '').trim(),
            memo: String(raw?.memo || raw?.tag || raw?.memo_tag || '').trim() || undefined,
          }
        : null;
      setDeposit(normalized);
      showToast('success', 'Dirección generada');
      setPollingActive(true);
    } catch (e) {
      console.error('[Wallet] /deposit/request error', e);
      showToast('error', e?.message || 'No se pudo generar la dirección');
      setDeposit(null);
    } finally {
      setDepositLoading(false);
    }
  };

  const handleConfirmDeposit = async () => {
    setConfirmDepositLoading(true);
    try {
      const prev = lastBalanceRef.current;
      const res = await loadCuenta();
      const next = Number(res?.balance);
      if (Number.isFinite(next) && next > prev) {
        setPollingActive(false);
        showToast('success', 'Balance actualizado');
      } else {
        showToast('success', 'Actualizado. Aún no se confirma el depósito (intenta en unos minutos).');
      }
    } catch (e) {
      console.error('[Wallet] confirm deposit error', e);
      showToast('error', e?.message || 'No se pudo actualizar');
    } finally {
      setConfirmDepositLoading(false);
    }
  };

  useEffect(() => {
    if (!pollingActive) return;
    const id = window.setInterval(() => {
      loadCuenta().then((res) => {
        const prev = lastBalanceRef.current;
        const next = Number(res?.balance);
        if (Number.isFinite(next) && next > prev) {
          setPollingActive(false);
        }
      }).catch(() => {
        // ignore
      });
    }, 10_000);
    return () => window.clearInterval(id);
  }, [loadCuenta, pollingActive]);

  const validateWithdrawForm = () => {
    const monto = Number(withdrawForm.monto);
    if (!Number.isFinite(monto) || monto <= 0) return 'Monto inválido';
    if (monto < 10) return 'El retiro mínimo es 10 USDT';
    if (!withdrawForm.red) return 'Debes seleccionar una red';
    if (!withdrawForm.direccion.trim()) return 'Debes ingresar una dirección externa';
    if (!withdrawForm.pin.trim()) return 'Debes ingresar el PIN';
    if (!isCuentaActiva) return 'Tu cuenta no está activa';
    if (monto > balanceNumber) return 'Saldo insuficiente';
    return '';
  };

  const handleWithdrawValidate = async () => {
    const msg = validateWithdrawForm();
    if (msg) {
      showToast('error', msg);
      return;
    }
    setWithdrawLoading(true);
    try {
      const monto = Number(withdrawForm.monto);
      const data = await withdrawValidate({ monto, red: withdrawForm.red, pin: withdrawForm.pin });
      setWithdrawValidated(data || null);
      showToast('success', 'Validación correcta');
    } catch (e) {
      console.error('[Wallet] /api/withdraw/validate error', e);
      showToast('error', e?.message || 'No se pudo validar');
      setWithdrawValidated(null);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleWithdrawCreate = async () => {
    if (!withdrawValidated?.ok) {
      showToast('error', 'Primero valida el retiro');
      return;
    }
    setWithdrawLoading(true);
    try {
      const monto = Number(withdrawForm.monto);
      const data = await withdrawCreate({
        monto,
        red: withdrawForm.red,
        direccion: withdrawForm.direccion,
        pin: withdrawForm.pin,
      });
      setWithdrawCreated(data || null);
      showToast('success', 'Retiro creado. Procesando...');
      loadCuenta();
    } catch (e) {
      console.error('[Wallet] /api/withdraw/create error', e);
      showToast('error', e?.message || 'No se pudo crear el retiro');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const historyItems = useMemo(() => (Array.isArray(history) ? history : null), [history]);

  const extractStatusFromDescripcion = useCallback((descripcion) => {
    const d = String(descripcion || '').toLowerCase();
    if (!d) return '';
    if (d.includes('pendiente')) return 'pendiente';
    if (d.includes('enviado')) return 'enviado';
    if (d.includes('confirmado')) return 'confirmado';
    if (d.includes('aprobado')) return 'aprobado';
    if (d.includes('rechazado')) return 'rechazado';
    return '';
  }, []);

  const normalizeTipo = useCallback((tipo) => String(tipo || '').toLowerCase(), []);

  const kindFromTipo = useCallback((tipo) => {
    const t = normalizeTipo(tipo);
    if (['ingreso', 'deposito', 'depósito', 'deposit'].includes(t)) return 'deposito';
    if (['retiro', 'withdraw', 'withdrawal'].includes(t)) return 'retiro';
    if (['ganancia', 'ganancias', 'earning', 'earnings'].includes(t)) return 'ganancia';
    if (['suscripcion', 'suscripción', 'subscription', 'suscripciones'].includes(t)) return 'suscripcion';
    return t || 'movimiento';
  }, [normalizeTipo]);

  const normalizeMov = useCallback(
    (raw) => {
      const amount = raw?.monto != null ? Number(raw.monto) : null;
      const createdAt = raw?.creado_en || null;
      const kind = kindFromTipo(raw?.tipo);
      const status = extractStatusFromDescripcion(raw?.descripcion);

      return {
        id: raw?.id,
        usuario_id: raw?.usuario_id,
        kind,
        tipo: raw?.tipo,
        descripcion: raw?.descripcion,
        status,
        amount: Number.isFinite(amount) ? amount : null,
        createdAt,
      };
    },
    [extractStatusFromDescripcion, kindFromTipo],
  );

  const normalizedHistory = useMemo(() => (historyItems ? historyItems.map(normalizeMov) : []), [historyItems, normalizeMov]);

  const depositosPendientes = useMemo(
    () => normalizedHistory.filter((m) => m.kind === 'deposito' && m.status === 'pendiente'),
    [normalizedHistory],
  );

  const depositosOtros = useMemo(
    () => normalizedHistory.filter((m) => m.kind === 'deposito' && m.status !== 'pendiente'),
    [normalizedHistory],
  );

  const retirosPendientes = useMemo(
    () => normalizedHistory.filter((m) => m.kind === 'retiro' && m.status === 'pendiente'),
    [normalizedHistory],
  );

  const retirosEnviadosConfirmados = useMemo(
    () =>
      normalizedHistory.filter(
        (m) =>
          m.kind === 'retiro' && ['enviado', 'confirmado', 'aprobado'].includes(m.status),
      ),
    [normalizedHistory],
  );

  const retirosOtros = useMemo(
    () =>
      normalizedHistory.filter(
        (m) => m.kind === 'retiro' && !['pendiente', 'enviado', 'confirmado', 'aprobado'].includes(m.status),
      ),
    [normalizedHistory],
  );

  const withdrawMontoNumber = useMemo(() => Number(withdrawForm.monto), [withdrawForm.monto]);
  const insufficientByForm = useMemo(
    () => Number.isFinite(withdrawMontoNumber) && withdrawMontoNumber > 0 && withdrawMontoNumber > balanceNumber,
    [withdrawMontoNumber, balanceNumber],
  );
  const insufficientByValidated = useMemo(() => {
    const total = Number(withdrawValidated?.total);
    if (!Number.isFinite(total) || total <= 0) return false;
    return total > balanceNumber;
  }, [withdrawValidated?.total, balanceNumber]);

  return (
    <div className="min-h-screen bg-doja-bg text-white">
      <div className="mx-auto w-full max-w-[520px] px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[16px] font-semibold">Billetera</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-[12px] transition"
              onClick={() => {
                loadCuenta();
              }}
              disabled={loading || historyLoading}
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCw className={(loading || historyLoading) ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
                Actualizar
              </span>
            </button>
            <button
              type="button"
              className="text-[12px] text-white/70 hover:text-white"
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

        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[12px] text-white/70">Saldo interno</div>
            <div className="text-[16px] font-semibold text-doja-cyan">{formattedBalance} USDT</div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[12px] text-white/70">Total ganado</div>
            <div className="text-[12px] text-white/80">{formattedGanado} USDT</div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[12px] text-white/70">Estado</div>
            <div className="text-[12px] text-white/80">{estado}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCreateDepositAddress}
            disabled={depositLoading}
            className="rounded-2xl bg-doja-cyan/15 hover:bg-doja-cyan/20 border border-doja-cyan/30 p-4 text-left transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-doja-cyan font-semibold">
              <QrCode className="w-5 h-5" />
              Recargar
            </div>
            <div className="mt-1 text-[12px] text-white/70">Genera tu dirección de depósito</div>
          </button>

          <button
            type="button"
            onClick={openWithdraw}
            disabled={!isCuentaActiva || !(balanceNumber >= 10)}
            className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 text-left transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-white font-semibold">
              <Send className="w-5 h-5" />
              Retirar
            </div>
            <div className="mt-1 text-[12px] text-white/70">Solicitud de retiro (PIN)</div>
          </button>
        </div>

        {!isCuentaActiva ? (
          <div className="mt-3 text-[11px] text-red-400">
            Tu cuenta no está activa. No puedes retirar hasta que esté activa.
          </div>
        ) : null}

        {isCuentaActiva && !(balanceNumber >= 10) ? (
          <div className="mt-3 text-[11px] text-yellow-300">Necesitas mínimo 10 USDT para retirar.</div>
        ) : null}

        {deposit && (
          <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <WalletIcon className="w-5 h-5 text-doja-cyan" />
              Dirección de depósito
            </div>
            <div className="mt-3 flex items-start gap-4">
              <div className="min-w-0">
                <div className="text-[12px] text-white/60">Red</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="text-[12px] text-white/90 font-mono break-all">{depositNetwork || '—'}</div>
                  {depositNetwork ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(depositNetwork)}
                      className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                      aria-label="Copiar red"
                    >
                      <Copy className="w-4 h-4 text-white/70" />
                    </button>
                  ) : null}
                </div>
                <div className="mt-2 text-[12px] text-white/60">Dirección</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="text-[12px] text-white/90 font-mono break-all">{depositAddress || '—'}</div>
                  {depositAddress ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(depositAddress)}
                      className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                      aria-label="Copiar dirección"
                    >
                      <Copy className="w-4 h-4 text-white/70" />
                    </button>
                  ) : null}
                </div>

                {depositQrValue ? (
                  <>
                    <div className="mt-2 text-[12px] text-white/60">Enlace</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="text-[12px] text-white/90 font-mono break-all">{depositQrValue}</div>
                      <button
                        type="button"
                        onClick={() => handleCopy(depositQrValue)}
                        className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                        aria-label="Copiar enlace"
                      >
                        <Copy className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                  </>
                ) : null}
                {depositMemo ? (
                  <>
                    <div className="mt-2 text-[12px] text-white/60">Memo</div>
                    <div className="text-[12px] text-white/90 font-mono break-all">{depositMemo}</div>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={handleConfirmDeposit}
                  disabled={confirmDepositLoading}
                  className="mt-3 w-full rounded-xl bg-doja-cyan/20 hover:bg-doja-cyan/30 border border-doja-cyan/40 py-3 text-sm font-semibold text-doja-cyan transition disabled:opacity-50"
                >
                  {confirmDepositLoading ? 'Confirmando...' : 'Confirmar pago'}
                </button>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-white/60">
              Envía únicamente USDT por la red indicada. Si envías otra moneda o red, podrías perder los fondos.
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-[13px] font-semibold">Depósitos pendientes</div>
          {historyLoading ? (
            <div className="mt-2 text-[12px] text-white/60">Cargando...</div>
          ) : depositosPendientes.length ? (
            <div className="mt-3 space-y-2">
              {depositosPendientes.slice(0, 10).map((m, idx) => (
                <div key={m.id || idx} className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] text-white/80">depósito</div>
                    <div className="text-[12px] text-yellow-300 font-semibold">pendiente</div>
                  </div>
                  <div className="mt-1 text-[11px] text-white/60 font-mono break-words">
                    {m.amount != null ? `monto: ${m.amount.toFixed(2)} USDT` : ''}{m.createdAt ? ` · ${String(m.createdAt)}` : ''}
                  </div>
                  {m.descripcion ? (
                    <div className="mt-1 text-[11px] text-white/60 break-words">{String(m.descripcion)}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-[12px] text-white/60">No tienes depósitos pendientes</div>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-[13px] font-semibold">Depósitos</div>
          {historyLoading ? (
            <div className="mt-2 text-[12px] text-white/60">Cargando...</div>
          ) : depositosOtros.length ? (
            <div className="mt-3 space-y-2">
              {depositosOtros.slice(0, 10).map((m, idx) => (
                <div key={m.id || idx} className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] text-white/80">depósito</div>
                    <div className="text-[12px] text-doja-cyan font-semibold">{m.status || '—'}</div>
                  </div>
                  <div className="mt-1 text-[11px] text-white/60 font-mono break-words">
                    {m.amount != null ? `monto: ${m.amount.toFixed(2)} USDT` : ''}{m.createdAt ? ` · ${String(m.createdAt)}` : ''}
                  </div>
                  {m.descripcion ? (
                    <div className="mt-1 text-[11px] text-white/60 break-words">{String(m.descripcion)}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-[12px] text-white/60">No tienes depósitos</div>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-[13px] font-semibold">Retiros</div>
          {historyLoading ? (
            <div className="mt-2 text-[12px] text-white/60">Cargando...</div>
          ) : retirosPendientes.length || retirosEnviadosConfirmados.length || retirosOtros.length ? (
            <div className="mt-3 space-y-2">
              {retirosPendientes.slice(0, 10).map((m, idx) => (
                <div key={m.id || `p_${idx}`} className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] text-white/80">retiro</div>
                    <div className="text-[12px] text-yellow-300 font-semibold">pendiente</div>
                  </div>
                  <div className="mt-1 text-[11px] text-white/60 font-mono break-words">
                    {m.amount != null ? `monto: ${m.amount.toFixed(2)} USDT` : ''}{m.createdAt ? ` · ${String(m.createdAt)}` : ''}
                  </div>
                  {m.descripcion ? (
                    <div className="mt-1 text-[11px] text-white/60 break-words">{String(m.descripcion)}</div>
                  ) : null}
                </div>
              ))}
              {retirosEnviadosConfirmados.slice(0, 10).map((m, idx) => (
                <div key={m.id || `c_${idx}`} className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] text-white/80">retiro</div>
                    <div className="text-[12px] text-doja-cyan font-semibold">{m.status || '—'}</div>
                  </div>
                  <div className="mt-1 text-[11px] text-white/60 font-mono break-words">
                    {m.amount != null ? `monto: ${m.amount.toFixed(2)} USDT` : ''}{m.createdAt ? ` · ${String(m.createdAt)}` : ''}
                  </div>
                  {m.descripcion ? (
                    <div className="mt-1 text-[11px] text-white/60 break-words">{String(m.descripcion)}</div>
                  ) : null}
                </div>
              ))}

              {retirosOtros.slice(0, 10).map((m, idx) => (
                <div key={m.id || `o_${idx}`} className="rounded-xl border border-white/10 bg-doja-bg/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] text-white/80">retiro</div>
                    <div className="text-[12px] text-white/70 font-semibold">—</div>
                  </div>
                  <div className="mt-1 text-[11px] text-white/60 font-mono break-words">
                    {m.amount != null ? `monto: ${m.amount.toFixed(2)} USDT` : ''}{m.createdAt ? ` · ${String(m.createdAt)}` : ''}
                  </div>
                  {m.descripcion ? (
                    <div className="mt-1 text-[11px] text-white/60 break-words">{String(m.descripcion)}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-[12px] text-white/60">No tienes retiros</div>
          )}
        </div>
      </div>

      {withdrawOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-doja-bg/80"
            onClick={closeWithdraw}
            aria-label="Cerrar"
          />

          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-doja-dark/80 backdrop-blur p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Retirar USDT</div>
                <div className="mt-1 text-xs text-white/60">Primero valida, luego confirma.</div>
              </div>
              <button
                type="button"
                onClick={closeWithdraw}
                className="rounded-lg px-2 py-1 text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-2">Monto</label>
                <input
                  value={withdrawForm.monto}
                  onChange={(e) => setWithdrawForm((p) => ({ ...p, monto: e.target.value }))}
                  placeholder="5"
                  className="w-full rounded-xl bg-doja-bg/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-doja-cyan/50"
                />
                {insufficientByForm ? <div className="mt-2 text-[11px] text-yellow-300">Saldo insuficiente.</div> : null}
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-2">Red</label>
                <select
                  value={withdrawForm.red}
                  onChange={(e) => setWithdrawForm((p) => ({ ...p, red: e.target.value }))}
                  className="w-full rounded-xl bg-doja-bg/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-doja-cyan/50"
                >
                  <option value="BEP20-USDT">BEP20-USDT</option>
                  <option value="TRC20-USDT">TRC20-USDT</option>
                  <option value="ETH-USDT">ETH-USDT</option>
                  <option value="POLYGON-USDT">POLYGON-USDT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-2">Dirección externa</label>
                <input
                  value={withdrawForm.direccion}
                  onChange={(e) => setWithdrawForm((p) => ({ ...p, direccion: e.target.value }))}
                  placeholder="0x... / T..."
                  className="w-full rounded-xl bg-doja-bg/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-doja-cyan/50"
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-2">PIN</label>
                <input
                  type="password"
                  value={withdrawForm.pin}
                  onChange={(e) => setWithdrawForm((p) => ({ ...p, pin: e.target.value }))}
                  placeholder="1234"
                  className="w-full rounded-xl bg-doja-bg/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-doja-cyan/50"
                />
              </div>
            </div>

            {withdrawValidated?.ok ? (
              <div className="mt-4 rounded-xl border border-doja-cyan/30 bg-doja-cyan/10 p-3">
                <div className="text-xs text-white/70">Resumen</div>
                <div className="mt-1 text-sm text-doja-cyan font-semibold">
                  {Number(withdrawValidated?.monto || 0).toFixed(2)} + {Number(withdrawValidated?.fee || 0).toFixed(2)} = {Number(withdrawValidated?.total || 0).toFixed(2)} USDT
                </div>
                {insufficientByValidated ? (
                  <div className="mt-2 text-[11px] text-yellow-300">Saldo insuficiente para cubrir monto + fee.</div>
                ) : null}
              </div>
            ) : null}

            {withdrawCreated ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/70">Estado</div>
                <div className="mt-1 text-sm text-white/80">pendiente</div>
                {withdrawCreated?.id ? (
                  <div className="mt-1 text-[11px] text-white/60 font-mono break-all">id: {String(withdrawCreated.id)}</div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleWithdrawValidate}
                disabled={withdrawLoading || insufficientByForm || !isCuentaActiva}
                className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 py-3 text-sm font-semibold transition disabled:opacity-50"
              >
                {withdrawLoading ? 'Validando...' : 'Validar'}
              </button>
              <button
                type="button"
                onClick={handleWithdrawCreate}
                disabled={withdrawLoading || !withdrawValidated?.ok || insufficientByValidated}
                className="rounded-xl bg-doja-cyan/20 hover:bg-doja-cyan/30 border border-doja-cyan/40 py-3 text-sm font-semibold text-doja-cyan transition disabled:opacity-50"
              >
                {withdrawLoading ? 'Creando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
