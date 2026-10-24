'use client';

import React from 'react';
import { Shield, Lock, Users, ShoppingCart, Target, ArrowRight, Sparkles } from 'lucide-react';
import { HouseholdMember } from '@/lib/finance-logic';

interface ChildRestrictedViewProps {
  currentMember: HouseholdMember;
  sectionTitle: string;
  members: HouseholdMember[];
  onSelectMember: (memberId: string | 'all') => void;
  onNavigateToTab: (tab: string) => void;
}

export function ChildRestrictedView({
  currentMember,
  sectionTitle,
  members,
  onSelectMember,
  onNavigateToTab,
}: ChildRestrictedViewProps) {
  // Find adult members to offer quick switch
  const adultMembers = members.filter(
    (m) =>
      m.role === 'Administrador' ||
      m.role === 'Padre' ||
      m.role === 'Madre'
  );

  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/80 to-purple-950/20 p-8 shadow-xl text-center max-w-2xl mx-auto my-8">
      {/* Icon Shield */}
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10 mb-5">
        <Shield className="h-8 w-8 text-purple-400" />
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-purple-500/40 text-purple-300">
          <Lock className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/20 mb-3">
        <span>Jerarquía GASA: Modo Hijo/a Activo</span>
      </div>

      <h3 className="text-xl font-bold text-white tracking-tight">
        Vista Protegida: {sectionTitle}
      </h3>

      <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
        ¡Hola, <strong className="text-purple-300">{currentMember.name}</strong>! En la Familia Galindo Salomon,
        las finanzas generales (sueldos de los padres, compromisos bancarios y presupuestos de los adultos)
        están reservadas para papá, mamá o administradores.
      </p>

      {/* Suggested Child Activities */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left space-y-3">
        <span className="text-xs font-bold text-slate-200 block">
          ¿Qué puedes hacer desde tu perfil en GASA?
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => onNavigateToTab('supermarket')}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-left hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white group-hover:text-emerald-300 block">
                Lista de Supermercado
              </span>
              <span className="text-[11px] text-slate-400">
                Pide cosas que hagan falta en casa
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigateToTab('goals')}
            className="flex items-center gap-2.5 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-left hover:bg-teal-500/10 hover:border-teal-500/40 transition-all group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white group-hover:text-teal-300 block">
                Metas de Ahorro
              </span>
              <span className="text-[11px] text-slate-400">
                Revisa la meta de vacaciones o estudio
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Switch to parent / admin buttons */}
      {adultMembers.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-3">
            Para desbloquear la vista completa de finanzas, selecciona un perfil de Padre o Administrador:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {adultMembers.map((adult) => (
              <button
                key={adult.id}
                onClick={() => onSelectMember(adult.id)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 hover:border-emerald-500/50 transition-all"
              >
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <span>Cambiar a {adult.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
