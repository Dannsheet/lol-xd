import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, Gift, Home, User, UserPlus } from 'lucide-react';
import './BottomTabBar.css';

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = useMemo(
    () => [
      { id: 'home', label: 'Hogar', icon: Home, to: '/dashboard' },
      { id: 'promocion', label: 'Promoción', icon: Gift, to: '/promocion' },
      { id: 'vip', label: 'VIP', icon: Award, to: '/vip' },
      { id: 'invitar', label: 'Invitar amigos', icon: UserPlus, to: '/invitar' },
      { id: 'perfil', label: 'A mi', icon: User, to: '/perfil' },
    ],
    [],
  );

  const activeId = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/promocion')) return 'promocion';
    if (p.startsWith('/vip')) return 'vip';
    if (p.startsWith('/invitar')) return 'invitar';
    if (p.startsWith('/perfil')) return 'perfil';
    if (p.startsWith('/dashboard')) return 'home';
    return null;
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-doja-bg/90 border-t border-white/10 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-around px-2 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeId;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.to)}
              className={
                `min-w-[60px] px-2 py-1 flex flex-col items-center justify-center transition-all duration-200 ` +
                (active ? 'text-doja-cyan font-semibold' : 'text-white/60 hover:text-doja-light-cyan')
              }
              aria-label={tab.label}
            >
              <Icon
                className={
                  `w-6 h-6 mb-1 transition-all duration-200 transform ` +
                  (active ? 'scale-110' : 'scale-100')
                }
              />
              <span className="text-xs sm:text-sm leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
