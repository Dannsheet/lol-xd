import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const ANNOUNCEMENTS_VERSION = 'v2';

const AnnouncementsModal = () => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const storageKey = useMemo(() => {
    const uid = user?.id ? String(user.id) : 'anon';
    return `announcements_dismissed_${ANNOUNCEMENTS_VERSION}_${uid}`;
  }, [user?.id]);

  useEffect(() => {
    if (loading) return;
    const id = window.setTimeout(() => {
      if (!user?.id) {
        setOpen(false);
        setPage(0);
        return;
      }

      try {
        const dismissed = localStorage.getItem(storageKey);
        if (dismissed) {
          setOpen(false);
          return;
        }
      } catch {
        // ignore
      }

      setOpen(true);
      setPage(0);
    }, 0);

    return () => window.clearTimeout(id);
  }, [loading, storageKey, user?.id]);

  const pages = useMemo(
    () => [
      // TEXTO ANUNCIO PÁGINA 1: pega aquí el texto de la primera pantalla
      <div key="p1" className="text-sm text-white/90 leading-relaxed">
        <div className="text-center font-bold">
          📣 Bienvenido a la plataforma oficial DAJO
        </div>

        <div className="mt-4 space-y-3">
          <div>
            Una plataforma innovadora dedicada al entretenimiento digital y la valoración de tráilers de películas
            famosas, donde puedes generar ingresos diarios de forma simple y estable.
          </div>

          <div>
            🎬 DAJO conecta el entretenimiento con nuevas oportunidades digitales, permitiéndote ganar mientras
            interactúas con contenido audiovisual de alto impacto. ⭐✨
          </div>

          <div>
            📹 DAJO está comprometida con el desarrollo a largo plazo, ofreciendo una plataforma estable, segura y
            en constante optimización para todos sus usuarios. ⭐✨
          </div>
        </div>
      </div>,

      // TEXTO ANUNCIO PÁGINA 2: pega aquí el texto de la segunda pantalla
      <div key="p2" className="text-sm text-white/90 leading-relaxed">
        <div className="text-center font-bold">
          📣 Sistema VIP con ingresos diarios según tu nivel de participación ⭐✨
        </div>

        <div className="mt-4">
          <div className="font-semibold">🎥 Planes VIP – Ingresos diarios:</div>

          <div className="mt-3 space-y-2">
            <div>💰 VIP 1: $16 → 1.1 USDT diarios</div>
            <div>💰 VIP 2: $40 → 2.85 USDT diarios</div>
            <div>💰 VIP 3: $80 → 5.70 USDT diarios</div>
            <div>💰 VIP 4: $100 → 7.15 USDT diarios</div>
            <div>💰 VIP 5: $200 → 17.85 USDT diarios</div>
            <div>💰 VIP 6: $400 → 28.6 USDT diarios</div>
            <div>💰 VIP 7: $600 → 42.85 USDT diarios</div>
            <div>💰 VIP 8: $1000 → 71.42 USDT diarios</div>
          </div>
        </div>
      </div>,

      <div key="p3" className="text-sm text-white/90 leading-relaxed">
        <div className="text-center font-bold">📣 Sistema de invitación y recompensas</div>

        <div className="mt-4 space-y-3">
          <div>
            Invita a otras personas a unirse a DAJO y recibe hasta el 17% cada vez que tu equipo adquiera un nivel
            VIP. ⭐✨
          </div>

          <div>👉 No necesitas experiencia, solo comparte tu enlace y genera ingresos calificando videos 🤩.</div>
        </div>

        <div className="mt-5 text-center font-bold">📌 ¿Cómo comenzar en DAJO?</div>

        <div className="mt-4 space-y-2">
          <div>1️⃣ Accede a la plataforma oficial de DAJO (no compartas tu contraseña).</div>
          <div>2️⃣ Registra tu cuenta con correo electrónico válido.</div>
          <div>3️⃣ Verifica tu información en tu correo personal.</div>
          <div>4️⃣ Deposita USDT desde tu exchange o billetera digital.</div>
          <div>5️⃣ Vincula tu billetera personal (BEP-20 -- BSC).</div>
        </div>

        <div className="mt-5 space-y-2">
          <div>📣 Depósito mínimo: 16 USDT 💸⭐✨</div>
          <div>📣 Retiro mínimo: 11 USDT 💸⭐✨</div>
          <div>📣 Comisión por retiro: $1 💸⭐✨</div>
          <div>📣 Bonificación: 15% en nivel 1 y 1% en nivel 2 y 3 💸⭐✨</div>
        </div>

        <div className="mt-5 space-y-2">
          <div>
            ✔️ Soporte activo: el equipo de atención al cliente de DAJO está disponible para ayudarte de 10 am a 6 pm
            (GMT-5).
          </div>
          <div>📞 Servicio en línea activo</div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="font-semibold">🔗 Enlaces oficiales</div>
          <div>Contacto soporte:</div>
          <a
            className="block text-doja-light-cyan break-words"
            href="https://t.me/dajoweb"
            target="_blank"
            rel="noreferrer"
          >
            Soporte Telegram: t.me/dajoweb
          </a>
          <div>Canal de Telegram:</div>
          <a
            className="block text-doja-light-cyan break-words"
            href="https://t.me/+ilGl4Gd5iX02ZDE5"
            target="_blank"
            rel="noreferrer"
          >
            Canal de Telegram: t.me/+ilGl4Gd5iX02ZDE5
          </a>
          <div>Grupo de Telegram:</div>
          <a
            className="block text-doja-light-cyan break-words"
            href="https://t.me/+7A4MLkKVNQtiN2Nh"
            target="_blank"
            rel="noreferrer"
          >
            Grupo de Telegram: t.me/+7A4MLkKVNQtiN2Nh
          </a>
          <div>Link de invitacion:</div>
          <a
            className="block text-doja-light-cyan break-words"
            href="https://www.dajoweb.org/?ref=1368AF63"
            target="_blank"
            rel="noreferrer"
          >
            https://www.dajoweb.org/?ref=1368AF63
          </a>
        </div>
      </div>,
    ],
    [],
  );

  const totalPages = pages.length;
  const isFirst = page <= 0;
  const isLast = page >= totalPages - 1;

  const close = () => {
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      // ignore
    }
    setOpen(false);
    setPage(0);
  };

  const next = () => {
    if (isLast) {
      close();
      return;
    }
    setPage((p) => Math.min(p + 1, totalPages - 1));
  };

  const prev = () => {
    setPage((p) => Math.max(p - 1, 0));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-doja-dark/90 shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="text-center text-lg font-semibold">Anuncio</div>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">{pages[page]}</div>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={isFirst}
            className="text-sm text-white/70 disabled:opacity-40"
          >
            Atrás
          </button>

          <button
            type="button"
            onClick={next}
            className="text-sm font-medium text-doja-light-cyan"
          >
            {isLast ? 'Cerrar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsModal;
