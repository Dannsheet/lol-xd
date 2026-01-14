import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { linkReferral } from '../../lib/api.js';

const Auth = () => {
  const VISIT_KEY = 'doja_auth_has_visited';
  const PENDING_INVITE_KEY = 'doja_pending_invite_code';

  const formatSupabaseError = (err) => {
    if (!err) return 'Error desconocido';
    if (typeof err === 'string') return err;
    const message = err.message || err.error_description || err.msg;
    const status = err.status || err.statusCode;
    const parts = [];
    if (message && message !== '{}') parts.push(message);
    if (err.code) parts.push(`code: ${err.code}`);
    if (err.details) parts.push(`details: ${err.details}`);
    if (err.hint) parts.push(`hint: ${err.hint}`);
    if (status) parts.push(`status: ${status}`);
    if (parts.length > 0) return parts.join(' | ');
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  const [isLogin, setIsLogin] = useState(() => {
    try {
      return localStorage.getItem(VISIT_KEY) === '1';
    } catch {
      return true;
    }
  });
  const [authMethod, setAuthMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isPrimaryHover, setIsPrimaryHover] = useState(false);
  const [isPrimaryFocus, setIsPrimaryFocus] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(VISIT_KEY) !== '1') {
        localStorage.setItem(VISIT_KEY, '1');
      }
    } catch (e) {
      void e;
    }
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const ref = String(params.get('ref') || '').trim();
      if (ref && !invitationCode) {
        setInvitationCode(ref);
      }
    } catch {
      // ignore
    }
  }, [invitationCode]);

  const consumePendingInviteCode = async () => {
    let code = '';
    try {
      code = String(localStorage.getItem(PENDING_INVITE_KEY) || '').trim();
    } catch {
      code = '';
    }

    if (!code) return;

    try {
      await linkReferral(code);
      try {
        localStorage.removeItem(PENDING_INVITE_KEY);
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = authMethod === 'mobile' ? { phone, password } : { email, password };
      const { error } = await supabase.auth.signInWithPassword(payload);
      if (error) {
        console.error('signInWithPassword error:', error);
        showToast('error', formatSupabaseError(error));
        return;
      }

      await consumePendingInviteCode();
    } catch (err) {
      console.error('signInWithPassword exception:', err);
      showToast('error', formatSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (password !== confirmPassword) {
        showToast('error', 'Las contraseñas no coinciden');
        return;
      }

      const userData = {
        invitation_code: invitationCode.trim() || null
      };

      const payload = authMethod === 'mobile'
        ? { phone, password, options: { data: userData } }
        : { email, password, options: { emailRedirectTo: window.location.origin, data: userData } };

      const { data, error } = await supabase.auth.signUp(payload);
      if (error) {
        console.error('signUp error:', error);
        showToast('error', formatSupabaseError(error));
        return;
      }

      const pending = invitationCode.trim();
      if (pending) {
        try {
          localStorage.setItem(PENDING_INVITE_KEY, pending);
        } catch {
          // ignore
        }
      }

      if (data?.session) {
        try {
          if (pending) {
            await linkReferral(pending);
            try {
              localStorage.removeItem(PENDING_INVITE_KEY);
            } catch {
              // ignore
            }
          }
        } catch {
          // ignore
        }

        showToast('success', 'Registro exitoso');
        return;
      }

      showToast('success', authMethod === 'mobile' ? 'Revisa tu teléfono para verificar tu cuenta' : 'Revisa tu correo para verificar tu cuenta');
    } catch (err) {
      console.error('signUp exception:', err);
      showToast('error', formatSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '280px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{
              width: '250px',
              height: 'auto',
              margin: '0 auto',
              objectFit: 'contain'
            }} 
          />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {toast && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: `1px solid ${toast.type === 'error' ? '#ff4d4f' : '#8B5CF6'}`,
                backgroundColor: toast.type === 'error' ? 'rgba(255, 77, 79, 0.10)' : 'rgba(139, 92, 246, 0.10)',
                color: '#ffffff',
                fontSize: '12px',
                lineHeight: 1.3
              }}
            >
              {toast.message}
            </div>
          )}

          <h1 style={{
            fontSize: '18px',
            fontWeight: '300',
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '0.5px',
            margin: 0
          }}>
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>

          <form onSubmit={isLogin ? handleLogin : handleSignUp} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '10px',
              padding: '4px',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: authMethod === 'email' ? '#8B5CF6' : 'transparent',
                  boxShadow:
                    authMethod === 'email'
                      ? '0 0 0 1px rgba(139, 92, 246, 0.35), 0 0 14px rgba(139, 92, 246, 0.35)'
                      : 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'box-shadow 0.2s'
                }}
              >
                Correo electrónico
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('mobile')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: authMethod === 'mobile' ? '#8B5CF6' : 'transparent',
                  boxShadow:
                    authMethod === 'mobile'
                      ? '0 0 0 1px rgba(139, 92, 246, 0.35), 0 0 14px rgba(139, 92, 246, 0.35)'
                      : 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'box-shadow 0.2s'
                }}
              >
                Móvil
              </button>
            </div>

            <div>
              {authMethod === 'email' ? (
                <>
                  <label 
                    htmlFor="email" 
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      color: '#ffffff',
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}
                  >
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="Correo electrónico"
                    autoComplete='email'
                    required
                  />
                </>
              ) : (
                <>
                  <label 
                    htmlFor="phone" 
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      color: '#ffffff',
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}
                  >
                    Número de teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="Ej: +1 555 123 4567"
                    autoComplete='tel'
                    required
                  />
                </>
              )}
            </div>

          

            <div>
              <label 
                htmlFor="password" 
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#ffffff',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}
              >
                Contraseña
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 38px 8px 12px',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #333333',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="Contraseña"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#888888'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 22 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2 12Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.6" />
                    {showPassword ? (
                      <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    ) : null}
                  </svg>
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#ffffff',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}
                >
                  Repetir contraseña
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 38px 8px 12px',
                      backgroundColor: '#1a1a1a',
                      color: '#ffffff',
                      border: '1px solid #333333',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    placeholder="Repetir contraseña"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '10px',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#888888'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 22 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2 12Z" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.6" />
                      {showConfirmPassword ? (
                        <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      ) : null}
                    </svg>
                  </button>
                </div>
              </div>
            )}
  {!isLogin && (
              <div>
                <label 
                  htmlFor="invitationCode" 
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#ffffff',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}
                >
                  Código de invitación
                </label>
                <input
                  type="text"
                  id="invitationCode"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
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
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="Código de invitación"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => {
                if (!loading) setIsPrimaryHover(true);
              }}
              onMouseLeave={() => setIsPrimaryHover(false)}
              onFocus={() => {
                if (!loading) setIsPrimaryFocus(true);
              }}
              onBlur={() => setIsPrimaryFocus(false)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#8B5CF6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transform: isPrimaryHover || isPrimaryFocus ? 'translateY(-1px)' : 'translateY(0px)',
                filter: isPrimaryHover || isPrimaryFocus ? 'brightness(1.05)' : 'brightness(1)',
                boxShadow:
                  isPrimaryHover || isPrimaryFocus
                    ? '0 0 0 1px rgba(139, 92, 246, 0.35), 0 0 18px rgba(139, 92, 246, 0.55), 0 0 42px rgba(139, 92, 246, 0.25)'
                    : '0 0 0 1px rgba(139, 92, 246, 0.18), 0 10px 24px rgba(0, 0, 0, 0.35)',
                transition: 'background-color 0.2s, box-shadow 0.2s, transform 0.2s, filter 0.2s'
              }}
            >
              {loading ? 'Cargando...' : (isLogin ? 'Iniciar sesión' : 'Registrarse')}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            paddingTop: '4px',
            fontSize: '11px'
          }}>
            <span style={{ color: '#888888' }}>
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                color: '#8B5CF6',
                background: 'none',
                border: 'none',
                marginLeft: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
