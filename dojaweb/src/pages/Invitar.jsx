import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../hooks/useAuth';
import './Invitar.css';

const Invitar = () => {
  const { user } = useAuth();

  const [toast, setToast] = useState(null);

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

  const inviteLink = useMemo(() => {
    if (!inviteCode) return '';
    const base = String(window.location.origin || '').replace(/\/$/, '');
    return `${base}/?ref=${encodeURIComponent(inviteCode)}`;
  }, [inviteCode]);

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

  return (
    <div className="min-h-full bg-doja-bg text-white p-4">
      <h1 className="text-2xl font-bold text-center">Invitar a amigos</h1>

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
        <div className="text-sm text-white/70">Código de invitación</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold">
            {inviteCode || '—'}
          </div>
          <button
            type="button"
            onClick={() => handleCopy(inviteCode)}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
            aria-label="Copiar código"
          >
            <Copy className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="mt-4 text-sm text-white/70">Enlace de invitación</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs sm:text-sm font-medium break-all">
            {inviteLink || '—'}
          </div>
          <button
            type="button"
            onClick={() => handleCopy(inviteLink)}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
            aria-label="Copiar enlace"
          >
            <Copy className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center">
          <div className="rounded-2xl bg-white p-4">
            <QRCodeCanvas value={inviteLink || ''} size={190} includeMargin />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">🌟🌟🌟🌟🌟🌟 Reembolso de recarga del equipo:</div>
        <div className="mt-3 space-y-2 text-sm text-white/80">
          <div>🎁Reembolso por recarga de nivel 1: 15%</div>
          <div>🎁🎁Reembolso por recarga de nivel 2: 1%</div>
          <div>🎁🎁🎁Reembolso por recarga de nivel 3: 1%</div>
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
};

export default Invitar;
