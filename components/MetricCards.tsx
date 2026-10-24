'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  Sparkles,
  AlertCircle,
  PiggyBank,
  Users,
  ShieldCheck,
  ShoppingCart,
  Target,
  Smile,
} from 'lucide-react';
import { MonthlySummary, formatAmount } from '@/lib/finance-logic';

interface MetricCardsProps {
  summary: MonthlySummary;
  householdTotalIncome: number;
  currencySymbol: string;
  activeMemberName?: string;
  isIndividualProfile: boolean;
  isChildProfile?: boolean;
  childSupermarketCount?: number;
  onNavigateToTab: (tab: string) => void;
}

export function MetricCards({
  summary,
  householdTotalIncome,
  currencySymbol,
  activeMemberName,
  isIndividualProfile,
  isChildProfile = false,
  childSupermarketCount = 0,
  onNavigateToTab,
}: MetricCardsProps) {
  const isPositive = summary.netBalance >= 0;

  // CHILD MODE: Protect adult finances and show age-appropriate metrics
  if (isChildProfile) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Mi Ahorro / Alcancía Propia */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-slate-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              Mi Alcancía ({activeMemberName || 'Hijo'})
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-white">
              {currencySymbol}{formatAmount(summary.totalIncome)}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-purple-300">
              <Sparkles className="h-3 w-3" />
              <span>Tus ahorros o aportes personales</span>
            </div>
          </div>
        </div>

        {/* 2. Supermercado / Pedidos del Hogar */}
        <div
          onClick={() => onNavigateToTab('supermarket')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-slate-900/80 p-5 shadow-lg hover:border-emerald-400/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Tus Pedidos de Súper
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-white">
              {childSupermarketCount} productos
            </p>
            <p className="mt-1 text-xs text-emerald-300/80 group-hover:underline">
              Ver lista y pedir lo que falta en casa →
            </p>
          </div>
        </div>

        {/* 3. Metas Familiares */}
        <div
          onClick={() => onNavigateToTab('goals')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-b from-teal-950/40 to-slate-900/80 p-5 shadow-lg hover:border-teal-400/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
              Metas de Ahorro
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-teal-300">
              Familia & Metas
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Vacaciones, educación y proyectos familiares
            </p>
          </div>
        </div>

        {/* 4. Jerarquía / Privacidad Protegida */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Finanzas Protegidas
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-purple-400 border border-slate-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold tracking-tight text-purple-300">
              Modo Hijo Activo
            </p>
            <p className="mt-1 text-xs text-slate-400 leading-snug">
              Los salarios y deudas de los padres están reservados por seguridad familiar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Ingresos */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isIndividualProfile
              ? `Tus Ingresos (${activeMemberName || 'Perfil'})`
              : 'Ingresos Totales del Hogar'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-white">
            {currencySymbol}{formatAmount(summary.totalIncome)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            {isIndividualProfile ? (
              <span className="text-[11px] text-teal-300">
                ↗ Se suma al pozo del Hogar ({currencySymbol}{formatAmount(householdTotalIncome)})
              </span>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                <span>Suma total de toda la familia</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Egresos */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isIndividualProfile ? 'Tus Gastos Asignados' : 'Gastos Totales del Hogar'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-white">
            {currencySymbol}{formatAmount(summary.totalExpenses)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {isIndividualProfile
              ? 'Gastos registrados a tu nombre'
              : 'Servicios, cuotas y compras familiares'}
          </p>
        </div>
      </div>

      {/* 3. Balance Neto / Superávit */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isIndividualProfile ? 'Tu Balance Disponible' : 'Balance Neto Familiar'}
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              isPositive
                ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p
            className={`text-2xl font-bold tracking-tight ${
              isPositive ? 'text-teal-300' : 'text-amber-400'
            }`}
          >
            {currencySymbol}{formatAmount(summary.netBalance)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
            <PiggyBank className="h-3 w-3 text-teal-400" />
            <span>Tasa de ahorro: <strong className="text-white">{summary.savingsRate}%</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Pendientes & Vencimientos */}
      <div
        onClick={() => onNavigateToTab('payments')}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg hover:border-slate-700 transition-all"
        role="button"
        tabIndex={0}
        aria-label="Ir a sección de cuotas y vencimientos pendientes"
        onKeyDown={(e) => e.key === 'Enter' && onNavigateToTab('payments')}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cuotas por Vencer
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              summary.urgentPaymentsCount > 0
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight text-white">
              {summary.pendingPaymentsCount}
            </p>
            <span className="text-xs text-slate-400">
              ({currencySymbol}{formatAmount(summary.pendingPaymentsAmount)})
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-400">
            {summary.urgentPaymentsCount > 0 ? (
              <>
                <AlertCircle className="h-3 w-3 text-amber-400" />
                <span>{summary.urgentPaymentsCount} vencen pronto o hoy</span>
              </>
            ) : (
              <span className="text-emerald-400">¡Al día con las cuotas!</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
