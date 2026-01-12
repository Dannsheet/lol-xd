import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeftRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import Trailers from '../components/Trailers/Trailers';

const slides = [
  { 
    image: '/imagen1.png',
    alt: 'Promoción 1'
  },
  { 
    image: '/imagen2.png',
    alt: 'Promoción 2'
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsAdmin(false);
  }, [user?.id]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-doja-bg text-white">
      {/* Carousel */}
      <div className="relative w-full h-[25vh] min-h-[180px] max-h-[260px] md:h-[35vh] md:min-h-[280px] md:max-h-[400px] lg:h-[45vh] lg:min-h-[350px] lg:max-h-[500px] overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-3 py-2 rounded-full bg-doja-cyan/20 backdrop-blur-md hover:bg-doja-cyan/30 transition-all text-xs md:text-sm text-doja-light-cyan border border-doja-cyan/30"
            >
              Panel Admin
            </button>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="px-3 py-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-xs md:text-sm"
          >
            Cerrar sesión
          </button>
        </div>

        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img 
              src={slide.image} 
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        <button onClick={prevSlide} className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all" aria-label="Anterior">
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        
        <button onClick={nextSlide} className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all" aria-label="Siguiente">
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-[10px] md:h-3 rounded-full transition-all ${index === currentSlide ? 'w-10 md:w-12 bg-doja-cyan' : 'w-[10px] md:w-3 bg-white/40 hover:bg-white/60'}`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Horizontal for all screens, with different gaps */}
        <div className="flex flex-row items-center justify-center gap-8 md:gap-12 lg:gap-20">
          <button onClick={() => navigate('/wallet')} className="group flex flex-col items-center justify-center transition-all duration-300">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-orange-500/50">
              <Wallet className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
            </div>
            <span className="text-white text-sm md:text-base lg:text-lg font-medium mt-3">Billetera</span>
          </button>

          <button
            onClick={() => navigate('/wallet', { state: { openWithdraw: true } })}
            className="group flex flex-col items-center justify-center transition-all duration-300"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-doja-cyan to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-doja-cyan/50">
              <ArrowLeftRight className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
            </div>
            <span className="text-white text-sm md:text-base lg:text-lg font-medium mt-3">Retirar</span>
          </button>

          <button onClick={() => navigate('/tutorial')} className="group flex flex-col items-center justify-center transition-all duration-300">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-purple-500/50">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
            </div>
            <span className="text-white text-sm md:text-base lg:text-lg font-medium mt-3">Tutorial del Sistema</span>
          </button>
        </div>
      </div>

      {/* Trailers Placeholder */}
      <div className="container mx-auto px-4 pb-12 md:pb-16">
        <Trailers />
      </div>
    </div>
  );
};

export default Dashboard;
