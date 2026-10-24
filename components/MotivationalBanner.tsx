'use client';

import React from 'react';
import { Sparkles, Trophy, CheckCircle, ArrowRight } from 'lucide-react';

interface MotivationalBannerProps {
  bannerData: {
    title: string;
    message: string;
    emoji: string;
    type?: string;
  } | null;
  onOpenAdvisor: () => void;
  onDismiss?: () => void;
}

export function MotivationalBanner({
  bannerData,
  onOpenAdvisor,
  onDismiss,
}: MotivationalBannerProps) {
  if (!bannerData) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/60 p-4 sm:p-5 text-slate-200 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-inner">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  Consejo Positivo del Hogar
                </span>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  Motivación Diaria
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                ¡Gran ritmo de organización familiar! Cada gasto anotado y cada cuota pagada a tiempo acerca a la familia a sus sueños.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all shrink-0"
          >
            <span>Ver Consejo IA</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 p-4 sm:p-5 shadow-xl animate-in fade-in slide-in-from-top-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-2xl shadow-lg shadow-emerald-500/30">
            {bannerData.emoji || '🎉'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                {bannerData.title}
              </h2>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                ¡Logro Familiar!
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed max-w-2xl">
              {bannerData.message}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Consultar Coach</span>
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Cerrar mensaje positivo"
              className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Listo ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
