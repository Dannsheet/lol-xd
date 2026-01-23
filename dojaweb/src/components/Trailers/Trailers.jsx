import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch, getCuentaInfo, getMyPlan, getVideosStatus, verVideo } from '../../lib/api.js';
import './Trailers.css';

const getBestMp4File = (videoFiles = []) => {
  const mp4s = videoFiles.filter((f) => (f.file_type || '').toLowerCase() === 'video/mp4');
  if (!mp4s.length) return null;

  const sorted = [...mp4s].sort((a, b) => {
    const aw = Number(a.width || 0);
    const bw = Number(b.width || 0);
    return aw - bw;
  });

  // Prefer a mid-size file if available to avoid huge downloads.
  const mid = sorted[Math.floor(sorted.length / 2)];
  return mid?.link || sorted[0]?.link || null;
};

const getPoster = (videoPictures = []) => {
  if (!videoPictures.length) return '';
  const sorted = [...videoPictures].sort((a, b) => Number(a.width || 0) - Number(b.width || 0));
  return sorted[Math.max(0, sorted.length - 1)]?.picture || sorted[0]?.picture || '';
};

const Trailers = ({ perPage = 12 }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userKey = user?.id || 'anon';
  const ratingsStorageKey = useMemo(() => `doja_trailer_ratings_${userKey}`, [userKey]);

  const [items, setItems] = useState([]);
  const [vipChecking, setVipChecking] = useState(true);
  const [vipActive, setVipActive] = useState(false);
  const [dailyStatus, setDailyStatus] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [registeringById, setRegisteringById] = useState({});
  const [ratings, setRatings] = useState(() => {
    try {
      const raw = localStorage.getItem(ratingsStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ratingsStorageKey);
      setRatings(raw ? JSON.parse(raw) : {});
    } catch {
      setRatings({});
    }
  }, [ratingsStorageKey]);

  const saveRatings = (next) => {
    setRatings(next);
    try {
      localStorage.setItem(ratingsStorageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const setVideoRating = (videoId, value) => {
    saveRatings({
      ...ratings,
      [String(videoId)]: value,
    });
  };

  const fetchJson = async (url) => {
    try {
      return await apiFetch(url);
    } catch (e) {
      const status = e?.status;
      const msg = String(e?.message || '');
      const err = new Error(msg || `Pexels API error ${status || ''}`.trim());
      err.status = status;
      err.payload = e?.payload;
      throw err;
    }
  };

  const registerFirstView = useCallback(
    async (videoId) => {
      if (!user?.id) {
        setError('Debes iniciar sesión');
        return;
      }
      if (!vipActive) {
        setError('Necesitas una suscripción VIP activa');
        return;
      }

      const plans = Array.isArray(dailyStatus?.planes) ? dailyStatus.planes : [];
      const currentPlan = plans.find((p) => Number(p?.plan_id) === Number(selectedPlanId)) || plans[0] || null;
      if (currentPlan && currentPlan.puede_ver === false) {
        setError('Ya viste tu video de hoy, vuelve mañana');
        return;
      }

      const idKey = String(videoId);
      if (registeringById?.[idKey]) return;

      setRegisteringById((prev) => ({ ...prev, [idKey]: true }));
      try {
        const rating = Number(ratings?.[idKey] || 0) || null;
        await verVideo({ video_id: String(videoId), calificacion: rating, plan_id: selectedPlanId });

        try {
          await Promise.all([getVideosStatus().then(setDailyStatus), getCuentaInfo()]);
        } catch {
          // ignore
        }
      } catch (e) {
        console.error('[Trailers] register view error', e);
        const msg = String(e?.message || 'No se pudo registrar la vista');
        const lower = msg.toLowerCase();

        if (lower.includes('suscripción') || lower.includes('suscripcion') || lower.includes('sin suscripción')) {
          setError('Necesitas un plan activo para ver videos');
        } else if (lower.includes('video ya') || lower.includes('ya fue visto')) {
          setError('Ya completaste tu tarea diaria');
        } else if (lower.includes('límite diario') || lower.includes('limite diario') || lower.includes('límite')) {
          setError('Ya viste tu video de hoy, vuelve mañana');
        } else if (lower.includes('no autentic')) {
          setError('Inicia sesión nuevamente');
        } else {
          setError(msg);
        }
      } finally {
        setRegisteringById((prev) => {
          const next = { ...prev };
          delete next[idKey];
          return next;
        });
      }
    },
    [dailyStatus, ratings, registeringById, selectedPlanId, user?.id, vipActive]
  );

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data;
      try {
        data = await fetchJson(`/api/pexels/videos/search?query=movie&per_page=${perPage}&page=${page}`);
      } catch (e) {
        if (e?.status === 500) {
          data = await fetchJson(`/api/pexels/videos/popular?per_page=${perPage}&page=${page}`);
        } else {
          throw e;
        }
      }
      const videos = Array.isArray(data?.videos) ? data.videos : [];
      setHasNextPage(Boolean(data?.next_page));

      const mapped = videos
        .map((v) => {
          const src = getBestMp4File(v.video_files);
          const poster = getPoster(v.video_pictures);
          return {
            id: v.id,
            url: src,
            poster,
            duration: v.duration,
            width: v.width,
            height: v.height,
            user: v.user,
          };
        })
        .filter((v) => Boolean(v.url));

      setItems(mapped);
    } catch (e) {
      setError(e?.message || 'Error cargando trailers');
      setItems([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  const checkVip = useCallback(async () => {
    if (!user?.id) {
      setVipActive(false);
      setDailyStatus(null);
      setVipChecking(false);
      return;
    }

    setVipChecking(true);
    setError(null);
    try {
      let hasActivePlan = false;
      try {
        const plan = await getMyPlan();
        hasActivePlan = Boolean(plan?.plan_activo) || Boolean(plan?.plan_id);
      } catch (e) {
        if (e?.status === 404) {
          hasActivePlan = false;
        } else {
          throw e;
        }
      }

      if (!hasActivePlan) {
        setVipActive(false);
        setDailyStatus(null);
        return;
      }

      const status = await getVideosStatus();
      const limite = Number(status?.limite_diario ?? 0);
      const hasDailyLimit = Number.isFinite(limite) && limite > 0;

      setVipActive(true);
      setDailyStatus(hasDailyLimit ? (status || null) : null);

      const plans = Array.isArray(status?.planes) ? status.planes : [];
      const firstPlanId = plans.length ? Number(plans[0]?.plan_id) : null;
      setSelectedPlanId((prev) => {
        if (prev != null && plans.some((p) => Number(p?.plan_id) === Number(prev))) return prev;
        return firstPlanId;
      });
    } catch (e) {
      console.error('[Trailers] vip check error', e);
      setVipActive(false);
      setDailyStatus(null);
      setSelectedPlanId(null);
      setError(e?.message || 'No se pudo validar la suscripción');
    } finally {
      setVipChecking(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    checkVip();
  }, [checkVip]);

  useEffect(() => {
    if (vipChecking) return;
    if (!vipActive) {
      setItems([]);
      return;
    }
    fetchVideos();
  }, [dailyStatus, fetchVideos, vipActive, vipChecking]);

  const unlockedVideoId = useMemo(() => {
    if (!vipActive) return null;
    const plans = Array.isArray(dailyStatus?.planes) ? dailyStatus.planes : [];
    const currentPlan = plans.find((p) => Number(p?.plan_id) === Number(selectedPlanId)) || plans[0] || null;
    if (currentPlan && currentPlan.puede_ver === false) return null;
    if (!items?.length) return null;

    const seedRaw = currentPlan?.daily_seed;
    const seed = Number(seedRaw);
    const idx = Number.isFinite(seed) ? Math.abs(seed) % items.length : 0;
    return items[idx]?.id ?? items?.[0]?.id ?? null;
  }, [dailyStatus, items, selectedPlanId, vipActive]);

  const currentPlanInfo = useMemo(() => {
    const plans = Array.isArray(dailyStatus?.planes) ? dailyStatus.planes : [];
    return plans.find((p) => Number(p?.plan_id) === Number(selectedPlanId)) || plans[0] || null;
  }, [dailyStatus, selectedPlanId]);

  return (
    <section className="trailers">
      <div className="trailers__header">
        <h2 className="trailers__title">Sección de trailers</h2>
        <button
          type="button"
          className="trailers__refresh"
          onClick={() => {
            if (!vipActive) {
              checkVip();
              return;
            }
            setPage(1);
            fetchVideos();
          }}
          disabled={loading || vipChecking}
        >
          {vipChecking ? 'Validando…' : loading ? 'Cargando…' : vipActive ? 'Actualizar' : 'Verificar'}
        </button>
      </div>

      <div className="trailers__attribution">
        <a href="https://www.pexels.com" target="_blank" rel="noreferrer">
          Videos provided by Pexels
        </a>
      </div>

      {error ? <div className="trailers__error">{error}</div> : null}

      {!vipChecking && (!vipActive || (currentPlanInfo && currentPlanInfo.puede_ver === false)) ? (
        <div className="trailers__locked">
          <div className="trailers__lockedTitle">Contenido exclusivo VIP</div>
          <div className="trailers__lockedText">
            {!vipActive
              ? 'Para ver los videos debes tener una suscripción VIP activa.'
              : 'Ya viste tu video de hoy, vuelve mañana.'}
          </div>
          {currentPlanInfo && typeof currentPlanInfo.recompensa === 'number' ? (
            <div className="trailers__lockedText">Recompensa: {Number(currentPlanInfo.recompensa).toFixed(2)} USDT</div>
          ) : null}
          <button type="button" className="trailers__lockedCta" onClick={() => navigate('/vip')}>
            Ver planes VIP
          </button>
        </div>
      ) : null}

      {vipActive && Array.isArray(dailyStatus?.planes) && dailyStatus.planes.length > 1 ? (
        <div className="trailers__planPicker">
          <div className="trailers__planPickerTitle">Selecciona un plan</div>
          <div className="trailers__planPickerList">
            {dailyStatus.planes.map((p) => {
              const pid = Number(p?.plan_id);
              const activeBtn = Number(pid) === Number(selectedPlanId);
              const label = `Plan ${pid}`;
              return (
                <button
                  key={pid}
                  type="button"
                  className={activeBtn ? 'trailers__planBtn trailers__planBtn--active' : 'trailers__planBtn'}
                  onClick={() => setSelectedPlanId(pid)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="trailers__grid" aria-hidden={!vipActive}>
        {items.map((item) => {
          const current = Number(ratings?.[String(item.id)] || 0);
          const rated = Boolean(ratings?.[String(item.id)]);
          const isLocked =
            !vipActive || (unlockedVideoId != null && item.id !== unlockedVideoId) || unlockedVideoId == null;

          return (
            <div key={item.id} className={isLocked ? 'trailers__card trailers__card--locked' : 'trailers__card'}>
              <div className="trailers__videoWrap">
                <video
                  className={isLocked ? 'trailers__video trailers__video--locked' : 'trailers__video'}
                  controls={!isLocked}
                  preload="metadata"
                  poster={item.poster}
                  src={item.url}
                  onEnded={isLocked ? undefined : () => registerFirstView(item.id)}
                />

                {isLocked ? (
                  <div className="trailers__lockOverlay">
                    <Lock className="trailers__lockIcon" />
                    <div className="trailers__lockText">Solo puedes ver 1 video por plan</div>
                  </div>
                ) : null}
              </div>

              <div className="trailers__meta">
                <div className="trailers__rating">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={v <= current ? 'trailers__star trailers__star--on' : 'trailers__star'}
                      onClick={() => setVideoRating(item.id, v)}
                      aria-label={`Calificar ${v} estrellas`}
                      title={`${v} estrellas`}
                    >
                      <Star className="trailers__starIcon" />
                    </button>
                  ))}
                </div>
                <div className="trailers__sub">
                  <span>{rated ? 'Calificado' : 'Nuevo'}</span>
                  <span>{item.duration ? `${item.duration}s` : ''}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!vipChecking && vipActive ? (
        <div className="trailers__pagination">
          <button
            type="button"
            className="trailers__pageBtn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || page <= 1}
          >
            Anterior
          </button>
          <div className="trailers__pageInfo">Página {page}</div>
          <button
            type="button"
            className="trailers__pageBtn"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || !hasNextPage}
          >
            Siguiente
          </button>
        </div>
      ) : null}

      {!vipChecking && vipActive && !loading && !error && !items.length ? (
        <div className="trailers__empty">No hay videos para mostrar.</div>
      ) : null}
    </section>
  );
};

export default Trailers;
