'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Sliders,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit2,
  X,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import {
  MonthlyBudget,
  Transaction,
  calculateBudgetComparison,
  formatAmount,
} from '@/lib/finance-logic';

interface MonthlyBudgetViewProps {
  budgets: MonthlyBudget[];
  transactions: Transaction[];
  currencySymbol: string;
  selectedMonth: string;
  onUpdateBudgets: (newBudgets: MonthlyBudget[]) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  alimentacion: 'Alimentación y Supermercado',
  vivienda: 'Vivienda y Alquiler',
  servicios: 'Servicios Básicos (Luz, Agua, Gas, Net)',
  transporte: 'Transporte y Combustible',
  salud: 'Salud, Farmacia y Seguros',
  educacion: 'Educación y Colegio',
  cuotas: 'Cuotas y Créditos',
  ocio: 'Ocio, Salidas y Paseos',
  ahorro: 'Ahorro Programado',
  otros: 'Otros Imprevistos',
};

export function MonthlyBudgetView({
  budgets,
  transactions,
  currencySymbol,
  selectedMonth,
  onUpdateBudgets,
}: MonthlyBudgetViewProps) {
  const [editingBudget, setEditingBudget] = useState<{ category: string; amount: string } | null>(null);

  const comparisons = calculateBudgetComparison(budgets, transactions, selectedMonth);

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.budgetedAmount, 0);
  const totalSpent = comparisons.reduce((acc, c) => acc + c.spent, 0);
  const overallPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;
    const num = parseFloat(editingBudget.amount);
    if (isNaN(num) || num < 0) return;

    const updated = budgets.map((b) =>
      b.category === editingBudget.category ? { ...b, budgetedAmount: num } : b
    );
    onUpdateBudgets(updated);
    setEditingBudget(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Presupuesto Mensual por Categoría
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajusta los límites de gasto a medida que avanza el mes para mantener el control.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <span className="text-slate-400">Consumo General:</span>
          <strong className={`font-bold ${overallPct > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {overallPct}%
          </strong>
        </div>
      </div>

      {/* Overview bar */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
          <div>
            <span className="text-slate-400">Total Gastado este mes: </span>
            <strong className="text-white text-sm">
              {currencySymbol}{formatAmount(totalSpent)}
            </strong>
          </div>
          <div>
            <span className="text-slate-400">Límite Total Presupuestado: </span>
            <strong className="text-slate-300 text-sm">
              {currencySymbol}{formatAmount(totalBudgeted)}
            </strong>
          </div>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPct > 100
                ? 'bg-rose-500'
                : overallPct > 85
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallPct)}%` }}
          />
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {comparisons.map((item) => {
          const isOver = item.isOverBudget;
          const isNear = item.percentage >= 85 && !isOver;

          return (
            <div
              key={item.category}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-4 shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white capitalize">
                      {CATEGORY_NAMES[item.category] || item.category}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gastado: <strong className="text-white">{currencySymbol}{formatAmount(item.spent)}</strong> de{' '}
                      {currencySymbol}{formatAmount(item.budgeted)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold rounded-lg px-2 py-0.5 border ${
                        isOver
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                          : isNear
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {item.percentage}%
                    </span>

                    <button
                      onClick={() =>
                        setEditingBudget({
                          category: item.category,
                          amount: item.budgeted.toString(),
                        })
                      }
                      aria-label={`Ajustar presupuesto de ${item.category}`}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Ajustar monto presupuestado"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver
                          ? 'bg-rose-500'
                          : isNear
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {isOver ? (
                        <span className="text-rose-400 font-semibold">
                          Excedido por {currencySymbol}{formatAmount(Math.abs(item.remaining))}
                        </span>
                      ) : (
                        <span>
                          Disponible: {currencySymbol}{formatAmount(item.remaining)}
                        </span>
                      )}
                    </span>
                    <span>{isOver ? '⚠️ Ajustar presupuesto' : '✓ En rango'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white capitalize">
                Ajustar Presupuesto: {CATEGORY_NAMES[editingBudget.category] || editingBudget.category}
              </h3>
              <button
                onClick={() => setEditingBudget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nuevo Límite Presupuestado ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={editingBudget.amount}
                  onChange={(e) =>
                    setEditingBudget({ ...editingBudget, amount: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBudget(null)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95"
                >
                  Actualizar Presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
