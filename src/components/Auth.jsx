import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert('Revisa tu correo para verificar tu cuenta');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-doja-dark text-doja-white px-2">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4" />
        </div>
        <div className="bg-[#1a222b] p-6 sm:p-8 rounded-2xl shadow-xl border border-doja-cyan">
          <div className="flex justify-center mb-6 gap-2">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-full transition-all text-base font-semibold ${isLogin ? 'bg-doja-cyan text-doja-dark shadow' : 'bg-transparent text-doja-light-cyan border border-doja-cyan'}`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-full transition-all text-base font-semibold ${!isLogin ? 'bg-doja-cyan text-doja-dark shadow' : 'bg-transparent text-doja-light-cyan border border-doja-cyan'}`}
            >
              Registrarse
            </button>
          </div>
          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-doja-light-cyan mb-1">Correo</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-doja-dark text-doja-white border border-doja-cyan placeholder:text-doja-light-cyan focus:outline-none focus:ring-2 focus:ring-doja-cyan"
                placeholder="tucorreo@email.com"
                autoComplete="email"
                required
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="invitationCode" className="block text-xs font-semibold text-doja-light-cyan mb-1">Código de Invitación</label>
                <input
                  type="text"
                  id="invitationCode"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-doja-dark text-doja-white border border-doja-cyan placeholder:text-doja-light-cyan focus:outline-none focus:ring-2 focus:ring-doja-cyan"
                  placeholder="Código de invitación"
                />
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-doja-light-cyan mb-1">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-doja-dark text-doja-white border border-doja-cyan placeholder:text-doja-light-cyan focus:outline-none focus:ring-2 focus:ring-doja-cyan"
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-doja-cyan text-doja-dark font-bold py-3 mt-2 shadow-lg hover:bg-doja-cyan/80 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
