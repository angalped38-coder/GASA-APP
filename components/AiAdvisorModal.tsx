'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Lightbulb,
  Quote,
  RefreshCw,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import {
  MonthlySummary,
  SavingsGoal,
  PendingPayment,
  HouseholdMember,
} from '@/lib/finance-logic';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthlySummary;
  goals: SavingsGoal[];
  payments: PendingPayment[];
  members: HouseholdMember[];
}

interface AdvisorResponse {
  message: string;
  tips: string[];
  quote: string;
  fallback?: boolean;
}

export function AiAdvisorModal({
  isOpen,
  onClose,
  summary,
  goals,
  payments,
  members,
}: AiAdvisorModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdvisorResponse | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          goals,
          pendingPayments: payments,
          members,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        throw new Error('Response not ok');
      }
    } catch (e) {
      setData({
        message:
          '¡Felicitaciones a todo el hogar por mantener este orden financiero! Los ingresos familiares están cubriendo los gastos principales y las cuotas se están administrando con disciplina. El trabajo en equipo es la mejor inversión del hogar.',
        tips: [
          'Mantengan la comunicación abierta sobre los gastos comunes cada semana.',
          'Sigan priorizando el pago de cuotas antes de su fecha de vencimiento para evitar recargos.',
          'Cada pequeño ahorro destinado a sus metas familiares es un paso hacia la libertad financiera.',
        ],
        quote: 'Un hogar donde todos colaboran con amor y claridad financiera, no tiene límites.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data) {
      fetchAdvice();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 sm:p-7 shadow-2xl">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-60 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Coach Positivo del Hogar
              </h3>
              <p className="text-xs text-slate-400">
                Análisis empático y motivacional con IA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar asesor"
            className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="mx-auto h-8 w-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-200">
              Analizando las finanzas del hogar con cariño y precisión...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Preparando consejos positivos y recomendaciones personalizadas.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Main message */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                <Heart className="h-3.5 w-3.5 fill-emerald-400" />
                <span>Mensaje Motivacional para la Familia</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {data?.message}
              </p>
            </div>

            {/* Tips */}
            {data?.tips && data.tips.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span>Recomendaciones Clave para este Mes</span>
                </div>
                <div className="space-y-2">
                  {data.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily quote */}
            {data?.quote && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <Quote className="mx-auto h-5 w-5 text-emerald-400/60 mb-1" />
                <p className="text-xs italic text-slate-300 font-serif">
                  &ldquo;{data.quote}&rdquo;
                </p>
              </div>
            )}

            {/* Footer action */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={fetchAdvice}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Actualizar Consejo</span>
              </button>

              <button
                onClick={onClose}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95"
              >
                ¡Gracias Coach!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
