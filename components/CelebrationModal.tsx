'use client';

import React from 'react';
import { Trophy, CheckCircle, Sparkles, X, HeartHandshake } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  emoji?: string;
  actionLabel?: string;
}

export function CelebrationModal({
  isOpen,
  onClose,
  title,
  message,
  emoji = '🎉',
  actionLabel = '¡Continuar organizando el hogar!',
}: CelebrationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          aria-label="Cerrar celebración"
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-4xl shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20">
          {emoji}
        </div>

        <div className="mt-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            ¡Victoria Financiera Familiar!
          </span>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
