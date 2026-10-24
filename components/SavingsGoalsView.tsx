'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  Plus,
  TrendingUp,
  Trophy,
  Edit2,
  Trash2,
  X,
  PiggyBank,
  CheckCircle,
  Compass,
} from 'lucide-react';
import { SavingsGoal, formatAmount } from '@/lib/finance-logic';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  currencySymbol: string;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'lastMilestoneAcknowledged'>) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onDepositToGoal: (goalId: string, amount: number) => void;
  openCreateModalTrigger?: boolean;
  onResetCreateModalTrigger?: () => void;
}

const GOAL_SUGGESTIONS = [
  { title: 'Fondo de Emergencia GASA', target: 15000000, category: 'emergencia' as const },
  { title: 'Vacaciones Familia Galindo Salomon', target: 8000000, category: 'vacaciones' as const },
  { title: 'Refacción / Ampliación del Hogar', target: 12000000, category: 'vivienda' as const },
  { title: 'Ahorro para Educación Universitaria', target: 10000000, category: 'educacion' as const },
];

export function SavingsGoalsView({
  goals,
  currencySymbol,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDepositToGoal,
  openCreateModalTrigger,
  onResetCreateModalTrigger,
}: SavingsGoalsViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<'emergencia' | 'vacaciones' | 'vivienda' | 'educacion' | 'compra' | 'deuda' | 'otro'>('emergencia');

  const openAddModal = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
    setCategory('emergencia');
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (openCreateModalTrigger) {
      openAddModal();
      if (onResetCreateModalTrigger) onResetCreateModalTrigger();
    }
  }, [openCreateModalTrigger, onResetCreateModalTrigger]);

  const applySuggestion = (s: typeof GOAL_SUGGESTIONS[0]) => {
    setTitle(s.title);
    setTargetAmount(s.target.toString());
    setCategory(s.category);
  };

  const openEditModal = (g: SavingsGoal) => {
    setEditingGoal(g);
    setTitle(g.title);
    setTargetAmount(g.targetAmount.toString());
    setCurrentAmount(g.currentAmount.toString());
    setTargetDate(g.targetDate || '');
    setCategory(g.category);
    setIsAddModalOpen(true);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    if (!title.trim() || isNaN(target) || target <= 0) return;

    if (editingGoal) {
      onUpdateGoal({
        ...editingGoal,
        title: title.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate: targetDate || undefined,
        category,
      });
    } else {
      onAddGoal({
        title: title.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate: targetDate || undefined,
        category,
        color: 'from-emerald-500 to-teal-600',
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    onDepositToGoal(depositGoal.id, amt);
    setDepositGoal(null);
    setDepositAmount('');
  };

  const quickDeposit = (amt: number) => {
    if (!depositGoal) return;
    onDepositToGoal(depositGoal.id, amt);
    setDepositGoal(null);
    setDepositAmount('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            GASA Objetivos y Metas de Ahorro Familiar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Familia Galindo Salomon: cada aporte suma y activa mensajes motivacionales automáticos.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>+ Agregar Nueva Meta</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isCompleted = pct >= 100;

          return (
            <div
              key={goal.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {isCompleted ? (
                        <Trophy className="h-5 w-5 text-amber-400" />
                      ) : (
                        <Target className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm line-clamp-1">
                        {goal.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {goal.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      aria-label={`Editar meta ${goal.title}`}
                      className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label={`Eliminar meta ${goal.title}`}
                      className="rounded-lg p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar & Percent */}
                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Progreso</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {pct}%
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Amounts */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Ahorrado</span>
                      <strong className="text-white text-sm">
                        {currencySymbol}{formatAmount(goal.currentAmount)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block">Objetivo</span>
                      <strong className="text-slate-300 text-sm">
                        {currencySymbol}{formatAmount(goal.targetAmount)}
                      </strong>
                    </div>
                  </div>

                  {goal.targetDate && (
                    <p className="mt-2 text-[11px] text-slate-400">
                      Fecha límite deseada: {goal.targetDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setDepositGoal(goal)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
                >
                  <PiggyBank className="h-4 w-4 text-emerald-400" />
                  <span>Aportar a la Meta</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Aporte a {depositGoal.title}
                </h3>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monto del Aporte en Guaraníes ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="1000"
                  min="1000"
                  required
                  placeholder="Ej. 250000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Quick deposit buttons for Guaraníes */}
              <div>
                <span className="block text-[11px] text-slate-400 mb-1.5">
                  Aportes rápidos sugeridos:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => quickDeposit(amt)}
                      className="rounded-xl border border-slate-700 bg-slate-950 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500 hover:text-emerald-300 transition-colors"
                    >
                      +{formatAmount(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95"
                >
                  Sumar al Ahorro GASA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingGoal ? 'Modificar Meta' : 'Agregar Nueva Meta - Familia Galindo Salomon'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Suggestions for new goals */}
            {!editingGoal && (
              <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                <span className="block text-[11px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-emerald-400" />
                  Sugerencias de metas familiares:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {GOAL_SUGGESTIONS.map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => applySuggestion(s)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-emerald-500 hover:text-white transition-colors"
                    >
                      {s.title} ({formatAmount(s.target)} ₲)
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleGoalSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre de la Meta Familiar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Vacaciones Familia Galindo Salomon, Fondo Emergencia GASA..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monto Objetivo en Guaraníes ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    required
                    placeholder="Ej. 15000000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ahorro Inicial ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="emergencia">Fondo de Emergencia</option>
                    <option value="vacaciones">Viajes / Vacaciones</option>
                    <option value="vivienda">Mejora / Reparación Hogar</option>
                    <option value="educacion">Educación / Futuro</option>
                    <option value="compra">Compra Importante</option>
                    <option value="deuda">Liquidación de Deuda</option>
                    <option value="otro">Otro Objetivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha Deseada (Opcional)
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95"
                >
                  {editingGoal ? 'Guardar Cambios' : 'Crear Meta GASA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
