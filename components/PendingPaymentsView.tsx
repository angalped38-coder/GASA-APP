'use client';

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Check,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  CreditCard,
  BellRing,
} from 'lucide-react';
import {
  PendingPayment,
  HouseholdMember,
  getPaymentUrgency,
  PaymentUrgency,
  formatAmount,
} from '@/lib/finance-logic';

interface PendingPaymentsViewProps {
  payments: PendingPayment[];
  members: HouseholdMember[];
  currencySymbol: string;
  selectedMonth: string;
  activeMemberId: string | 'all';
  onAddPayment: (payment: Omit<PendingPayment, 'id'>) => void;
  onUpdatePayment: (payment: PendingPayment) => void;
  onDeletePayment: (id: string) => void;
  onMarkPaid: (payment: PendingPayment, createExpense: boolean) => void;
  onToggleUnpaid: (id: string) => void;
}

export function PendingPaymentsView({
  payments,
  members,
  currencySymbol,
  selectedMonth,
  activeMemberId,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  onMarkPaid,
  onToggleUnpaid,
}: PendingPaymentsViewProps) {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'pending' | 'paid'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PendingPayment | null>(null);

  // Quick pay confirmation modal state
  const [payingPayment, setPayingPayment] = useState<PendingPayment | null>(null);
  const [alsoCreateExpense, setAlsoCreateExpense] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => `${selectedMonth}-28`);
  const [category, setCategory] = useState('servicios');
  const [assignedMemberId, setAssignedMemberId] = useState(
    activeMemberId !== 'all' ? activeMemberId : 'shared'
  );
  const [recurrence, setRecurrence] = useState<'once' | 'monthly' | 'biweekly' | 'yearly'>('monthly');
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [notes, setNotes] = useState('');

  const todayStr = '2026-10-24';

  const openAddModal = () => {
    setEditingPayment(null);
    setTitle('');
    setAmount('');
    setDueDate(`${selectedMonth}-28`);
    setCategory('servicios');
    setAssignedMemberId(activeMemberId !== 'all' ? activeMemberId : 'shared');
    setRecurrence('monthly');
    setReminderDaysBefore(3);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: PendingPayment) => {
    setEditingPayment(p);
    setTitle(p.title);
    setAmount(p.amount.toString());
    setDueDate(p.dueDate);
    setCategory(p.category);
    setAssignedMemberId(p.assignedMemberId);
    setRecurrence(p.recurrence);
    setReminderDaysBefore(p.reminderDaysBefore);
    setNotes(p.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    if (editingPayment) {
      onUpdatePayment({
        ...editingPayment,
        title: title.trim(),
        amount: num,
        dueDate,
        category,
        assignedMemberId,
        recurrence,
        reminderDaysBefore,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddPayment({
        title: title.trim(),
        amount: num,
        dueDate,
        category,
        assignedMemberId,
        isPaid: false,
        recurrence,
        reminderDaysBefore,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const initiatePayment = (p: PendingPayment) => {
    setPayingPayment(p);
    setAlsoCreateExpense(true);
  };

  const confirmPayment = () => {
    if (payingPayment) {
      onMarkPaid(payingPayment, alsoCreateExpense);
      setPayingPayment(null);
    }
  };

  // Filter items
  const filtered = payments.filter((p) => {
    // Member filter
    if (activeMemberId !== 'all' && p.assignedMemberId !== activeMemberId && p.assignedMemberId !== 'shared') {
      return false;
    }

    const urgency = getPaymentUrgency(p.dueDate, p.isPaid, todayStr);

    if (filter === 'paid') return p.isPaid;
    if (filter === 'pending') return !p.isPaid;
    if (filter === 'urgent') {
      return !p.isPaid && (urgency === 'overdue' || urgency === 'due_today' || urgency === 'due_soon');
    }
    return true;
  });

  const getUrgencyBadge = (p: PendingPayment) => {
    const urgency = getPaymentUrgency(p.dueDate, p.isPaid, todayStr);

    if (p.isPaid) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Pagado {p.paidDate ? `el ${p.paidDate}` : '✓'}
        </span>
      );
    }

    if (urgency === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[11px] font-bold text-rose-300 animate-pulse">
          <AlertTriangle className="h-3 w-3 text-rose-400" />
          ¡Vencido!
        </span>
      );
    }

    if (urgency === 'due_today') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
          <Clock className="h-3 w-3 text-amber-400" />
          ¡Vence Hoy!
        </span>
      );
    }

    if (urgency === 'due_soon') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
          <Clock className="h-3 w-3" />
          Próximo a vencer
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
        <Calendar className="h-3 w-3 text-slate-400" />
        Vence el {p.dueDate}
      </span>
    );
  };

  const getMemberName = (id: string) => {
    if (id === 'shared') return '🏡 Todo el Hogar';
    const m = members.find((mem) => mem.id === id);
    return m ? `👤 ${m.name}` : 'Miembro';
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Recordatorios de Cuotas y Vencimientos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mantén al día los compromisos del hogar y celebra cada pago resuelto.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>+ Nueva Cuota o Pago</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-slate-800 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Todos ({payments.length})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            filter === 'urgent'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          <AlertTriangle className="h-3 w-3" />
          <span>Urgentes</span>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-slate-800 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pendientes ({payments.filter((p) => !p.isPaid).length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            filter === 'paid'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>Pagados / Resueltos</span>
        </button>
      </div>

      {/* Payments Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400/60 mb-2" />
            <p className="text-sm font-semibold text-slate-200">
              No hay pagos en esta categoría.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ¡Excelente señal de que las cuotas familiares están al día!
            </p>
          </div>
        ) : (
          filtered.map((p) => {
            return (
              <div
                key={p.id}
                className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all shadow-md ${
                  p.isPaid
                    ? 'border-slate-800/60 bg-slate-900/40 opacity-80'
                    : 'border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Responsable: <strong className="text-slate-300">{getMemberName(p.assignedMemberId)}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {currencySymbol}{formatAmount(p.amount)}
                      </p>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {p.recurrence === 'monthly' ? 'Mensual' : p.recurrence}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {getUrgencyBadge(p)}
                    <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 capitalize">
                      {p.category}
                    </span>
                  </div>

                  {p.notes && (
                    <p className="mt-2 text-xs text-slate-400 bg-slate-950/40 rounded-lg p-2 border border-slate-800/40">
                      📝 {p.notes}
                    </p>
                  )}
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      aria-label={`Modificar cuota ${p.title}`}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Modificar fecha o monto de la cuota"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePayment(p.id)}
                      aria-label={`Eliminar cuota ${p.title}`}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Eliminar cuota"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {p.isPaid ? (
                    <button
                      onClick={() => onToggleUnpaid(p.id)}
                      className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2"
                    >
                      Marcar como pendiente
                    </button>
                  ) : (
                    <button
                      onClick={() => initiatePayment(p)}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Marcar como Pagado</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Pay Modal confirmation */}
      {payingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Resolver Pago Pendiente
                </h3>
              </div>
              <button
                onClick={() => setPayingPayment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4">
              <p className="text-sm text-slate-200">
                ¿Deseas marcar como liquidada la cuota{' '}
                <strong className="text-emerald-300">&ldquo;{payingPayment.title}&rdquo;</strong> por{' '}
                <strong className="text-white">{currencySymbol}{formatAmount(payingPayment.amount)}</strong>?
              </p>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alsoCreateExpense}
                    onChange={(e) => setAlsoCreateExpense(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-white">
                      Registrar automáticamente como egreso del mes
                    </span>
                    <p className="text-slate-400 mt-0.5">
                      Descontará este monto del balance mensual con la fecha de hoy.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPayingPayment(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmPayment}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95"
              >
                ¡Confirmar y Celebrar! 🎉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Cuota Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingPayment ? 'Modificar Cuota o Vencimiento' : 'Agregar Cuota o Recordatorio'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Título del Pago o Servicio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cuota Tarjeta, Luz, Hipoteca, Internet..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monto ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha Límite / Vencimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="servicios">Servicios Básicos (Luz, Agua, Gas)</option>
                    <option value="vivienda">Vivienda / Alquiler / Hipoteca</option>
                    <option value="cuotas">Cuota Crédito o Electrodoméstico</option>
                    <option value="educacion">Educación / Colegiatura</option>
                    <option value="salud">Salud / Seguro</option>
                    <option value="transporte">Seguro Auto / Transporte</option>
                    <option value="otros">Otros Pagos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="yearly">Anual</option>
                    <option value="once">Pago Único</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Responsable Asignado
                  </label>
                  <select
                    value={assignedMemberId}
                    onChange={(e) => setAssignedMemberId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="shared">🏡 Todo el Hogar</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        👤 {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Avisar con anticipación
                  </label>
                  <select
                    value={reminderDaysBefore}
                    onChange={(e) => setReminderDaysBefore(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="1">1 día antes</option>
                    <option value="3">3 días antes (Recomendado)</option>
                    <option value="5">5 días antes</option>
                    <option value="7">1 semana antes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas / Datos de pago
                </label>
                <input
                  type="text"
                  placeholder="Número de cuenta, enlace o referencia..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95"
                >
                  {editingPayment ? 'Guardar Cambios' : 'Crear Recordatorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
