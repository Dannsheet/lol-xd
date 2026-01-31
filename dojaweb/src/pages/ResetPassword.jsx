import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      // AuthProvider already updates session; this ensures the page rerenders when recovery session is set.
    });

    return () => {
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const canReset = useMemo(() => Boolean(session?.user), [session?.user]);

  const showToast = (type, message) => setToast({ type, message });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canReset) {
      showToast('error', 'El link no es válido o expiró. Solicita otro.');
      return;
    }

    if (!password || password.length < 6) {
      showToast('error', 'La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        showToast('error', error.message || 'No se pudo restablecer la contraseña');
        return;
      }

      showToast('success', 'Contraseña actualizada. Inicia sesión nuevamente.');

      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }

      navigate('/', { replace: true });
    } catch (err) {
      showToast('error', err?.message || 'No se pudo restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '320px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: '250px', height: 'auto', margin: '0 auto', objectFit: 'contain' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {toast && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: `1px solid ${toast.type === 'error' ? '#ff4d4f' : '#8B5CF6'}`,
                backgroundColor: toast.type === 'error' ? 'rgba(255, 77, 79, 0.10)' : 'rgba(139, 92, 246, 0.10)',
                color: '#ffffff',
                fontSize: '12px',
                lineHeight: 1.3,
              }}
            >
              {toast.message}
            </div>
          )}

          <h1
            style={{
              fontSize: '18px',
              fontWeight: '300',
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: '0.5px',
              margin: 0,
            }}
          >
            Restablecer contraseña
          </h1>

          {!canReset ? (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.10)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '12px',
                lineHeight: 1.35,
              }}
            >
              Abre este link desde tu correo. Si expiró, vuelve a solicitar la recuperación desde el inicio de sesión.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label
                htmlFor="newPassword"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#ffffff',
                  marginBottom: '4px',
                  fontWeight: '500',
                }}
              >
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  border: '1px solid #333333',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                placeholder="Nueva contraseña"
                autoComplete="new-password"
                disabled={!canReset || loading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#ffffff',
                  marginBottom: '4px',
                  fontWeight: '500',
                }}
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  border: '1px solid #333333',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                placeholder="Repetir contraseña"
                autoComplete="new-password"
                disabled={!canReset || loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!canReset || loading}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#8B5CF6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: !canReset || loading ? 'not-allowed' : 'pointer',
                opacity: !canReset || loading ? 0.5 : 1,
                boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.18), 0 10px 24px rgba(0, 0, 0, 0.35)',
                transition: 'background-color 0.2s, box-shadow 0.2s, transform 0.2s, filter 0.2s',
              }}
            >
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>

          <div style={{ textAlign: 'center', paddingTop: '4px', fontSize: '11px' }}>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              style={{
                color: '#8B5CF6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                textDecoration: 'underline',
              }}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
