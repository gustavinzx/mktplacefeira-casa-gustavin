'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzLm7uis6sOHCw4QvgNXiEz01JT2OXNeai8SlbBlK3yd8AoUIMZpqIJMJJuhMLChwdyJ6gq1i6SxElvlbf3UBQYI09fMy0Vy-sd3Znm0EziyOM_FheNCowsvbJRaY0Dz__ePE6emjpqPTAjEf6u6kgr1QWnJdqhWvz1sy8CMLANuMvHZT07qb28pEiXyMX9ODlII6bm51Paofijf4oGgq9kxXGoQ6a66poJA4sfD-NWZvlg9tQTb2FOrvKYbEmJ4RRpkU-6SoL0aI',
  '/images/feira_hero_1.png',
  '/images/feira_hero_3.png'
];

export default function CarouselHero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);

  return (
    <div className="relative w-full h-[480px] rounded-[32px] overflow-hidden mb-16 shadow-2xl shadow-green-900/20 group">
      {/* Images */}
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
            i === currentIndex ? 'opacity-100 blur-0 scale-100 z-10' : 'opacity-0 blur-[10px] scale-110 z-0'
          }`}
        >
          <img
            src={src}
            alt={`Feira Livre Banner ${i + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Warm Dark Overlay for Text Readability matching original style */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#150f09]/90 via-[#150f09]/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 pl-16 pr-10 md:pl-28 md:pr-14 py-10 flex flex-col justify-center max-w-2xl z-10 pointer-events-none">
        <div className="pointer-events-auto">
        <span className="inline-block px-4 py-1.5 bg-[#f97316] text-white text-[11px] font-black rounded-full mb-4 uppercase tracking-[0.2em] w-max shadow-md">
          OFERTA DO DIA
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold !text-white leading-[1.1] mb-5 drop-shadow-lg">
          Frescor da feira<br />direto na sua porta.
        </h1>
        <p className="!text-white/95 text-sm md:text-base font-bold max-w-md drop-shadow-md mb-8">
          Produtos colhidos hoje pelos melhores<br />produtores locais da sua região.
        </p>
        <Link href="/categories/ofertas-dia" className="inline-flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-8 py-4 rounded-full font-black text-sm shadow-lg shadow-[#10b981]/30 transition-all w-max active:scale-95">
          VER OFERTAS <ArrowRight size={18} />
        </Link>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prev}
        className="transition-all z-30 hover:bg-black/60"
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={next}
        className="transition-all z-30 hover:bg-black/60"
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <ChevronRight size={28} />
      </button>

      {/* Story-style Progress Pills */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-500 ease-out ${
              i === currentIndex ? 'w-16 bg-white/30' : 'w-3 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Ir para slide ${i + 1}`}
          >
            {i === currentIndex && (
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-full"
                style={{ animation: 'carousel-progress 6s linear forwards' }}
              />
            )}
          </button>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes carousel-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
}
