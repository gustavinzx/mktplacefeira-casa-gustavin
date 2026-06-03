'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { DEFAULT_BANNERS, BADGE_STYLES, ANUNCIANTE_CONFIG } from '@/lib/ads-data';
import type { AdBanner } from '@/lib/ads-data';

const INTERVAL_MS = 6000;

export default function RotatingBanner() {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/ads/banners')
      .then(r => r.json())
      .then(data => setBanners(data.banners ?? []))
      .catch(() => setBanners(DEFAULT_BANNERS.filter(b => b.ativo)));
  }, []);

  const goTo = useCallback((idx: number, total: number) => {
    setCurrent(((idx % total) + total) % total);
  }, []);

  const next = useCallback(() => goTo(current + 1, banners.length), [current, banners.length, goTo]);
  const prev = useCallback(() => goTo(current - 1, banners.length), [current, banners.length, goTo]);

  // Auto-advance
  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    intervalRef.current = setInterval(next, INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isHovered, next, banners.length]);

  if (banners.length === 0) {
    return (
      <div className="w-full rounded-[24px] overflow-hidden bg-gray-100 animate-pulse" style={{ aspectRatio: '3/1' }} />
    );
  }

  const banner = banners[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[24px] bg-gray-900 select-none"
      style={{ aspectRatio: '3/1' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slide images with cross-fade */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <img
            src={b.imageUrl}
            alt={b.titulo}
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* Gradient overlay — left-heavy for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.04) 100%)',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-20 md:px-32 py-8" style={{ zIndex: 3 }}>
        <div className="max-w-[640px]">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${BADGE_STYLES[banner.badgeType]}`}>
              {banner.badge}
            </span>
            {banner.isAd && banner.anuncianteType && (() => {
              const cfg = ANUNCIANTE_CONFIG[banner.anuncianteType];
              return (
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              );
            })()}
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] mb-3 tracking-tight">
            {banner.titulo}
          </h2>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-white/90 font-medium mb-6 leading-relaxed max-w-[500px]">
            {banner.subtitulo}
          </p>

          {/* Advertiser credit & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Link
              href={banner.linkUrl}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              {banner.cta}
              <ArrowRight size={18} />
            </Link>

            {banner.isAd && banner.anunciante && (
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">
                  Anunciante
                </span>
                <span className="text-sm text-white/80 font-bold">
                  {banner.anunciante}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* "Anúncio" tag for paid ads */}
      {banner.isAd && (
        <div className="absolute top-3 right-3" style={{ zIndex: 4 }}>
          <span className="text-[9px] font-black text-white/60 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md tracking-widest uppercase">
            Anúncio
          </span>
        </div>
      )}

      {/* Prev / Next arrows (visible on hover) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Banner anterior"
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            style={{ zIndex: 4, opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? 'auto' : 'none', transitionProperty: 'opacity, background-color' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            aria-label="Próximo banner"
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            style={{ zIndex: 4, opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? 'auto' : 'none', transitionProperty: 'opacity, background-color' }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 4 }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, banners.length)}
              aria-label={`Banner ${i + 1}`}
              className="rounded-full transition-all duration-300 bg-white"
              style={{ width: i === current ? 24 : 8, height: 8, opacity: i === current ? 1 : 0.45 }}
            />
          ))}
        </div>
      )}

      {/* Progress bar (auto-advance indicator) */}
      {banners.length > 1 && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20" style={{ zIndex: 4 }}>
          <div
            key={`${current}-progress`}
            className="h-full bg-white/60"
            style={{
              animation: `progressBar ${INTERVAL_MS}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
