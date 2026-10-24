'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  X,
  Check,
  Tag,
  Users,
} from 'lucide-react';
import { Transaction, HouseholdMember, TransactionType, formatAmount } from '@/lib/finance-logic';

interface TransactionsViewProps {
  transactions: Transaction[];
  members: HouseholdMember[];
  currencySymbol: string;
  selectedMonth: string;
  activeMemberId: string | 'all';
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  vivienda: 'Vivienda / Alquiler',
  alimentacion: 'Alimentación / Super',
  servicios: 'Servicios (Luz, Agua, Gas)',
  transporte: 'Transporte / Gasolina',
  salud: 'Salud y Farmacia',
  educacion: 'Educación y Libros',
  cuotas: 'Cuotas y Créditos',
  ocio: 'Ocio y Salidas',
  ahorro: 'Ahorro / Fondo',
  salario: 'Salario / Nómina',
  honorarios: 'Honorarios / Freelance',
  negocio: 'Negocio Propio',
  renta: 'Renta / Inversión',
  aporte_familiar: 'Aporte Familiar',
  otros_ingresos: 'Otros Ingresos',
  otros: 'Otros Gastos',
};

export function TransactionsView({
  transactions,
  members,
  currencySymbol,
  selectedMonth,
  activeMemberId,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}: TransactionsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form state
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('alimentacion');
  const [date, setDate] = useState(() => `${selectedMonth}-15`);
  const [memberId, setMemberId] = useState(activeMemberId !== 'all' ? activeMemberId : 'shared');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'debito' | 'credito' | 'transferencia' | 'otro'>('debito');
  const [notes, setNotes] = useState('');

  const openAddModal = (initialType?: TransactionType) => {
    setEditingTransaction(null);
    setConcept('');
    setAmount('');
    const newType = initialType || 'expense';
    setType(newType);
    setCategory(newType === 'income' ? 'salario' : 'alimentacion');
    setDate(new Date().toISOString().split('T')[0]);
    setMemberId(activeMemberId !== 'all' ? activeMemberId : 'shared');
    setPaymentMethod('debito');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setConcept(t.concept);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategory(t.category);
    setDate(t.date);
    setMemberId(t.memberId);
    setPaymentMethod(t.paymentMethod);
    setNotes(t.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!concept.trim() || isNaN(numAmount) || numAmount <= 0) return;

    if (editingTransaction) {
      onUpdateTransaction({
        ...editingTransaction,
        concept: concept.trim(),
        amount: numAmount,
        type,
        category,
        date,
        memberId,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddTransaction({
        concept: concept.trim(),
        amount: numAmount,
        type,
        category,
        date,
        memberId,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered transactions for current view
  const filtered = transactions.filter((t) => {
    // Month filter
    if (!t.date.startsWith(selectedMonth)) return false;

    // Member filter
    if (activeMemberId !== 'all' && t.memberId !== activeMemberId && t.memberId !== 'shared') {
      return false;
    }

    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    // Search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchConcept = t.concept.toLowerCase().includes(q);
      const matchCat = (CATEGORY_LABELS[t.category] || t.category).toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q) || false;
      if (!matchConcept && !matchCat && !matchNotes) return false;
    }

    return true;
  });

  const getMemberLabel = (id: string) => {
    if (id === 'shared') return '🏡 Hogar (Compartido)';
    const m = members.find((mem) => mem.id === id);
    return m ? `👤 ${m.name}` : 'Miembro';
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Ingresos y Egresos del Mes
          </h2>
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
            {filtered.length} movimientos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAddModal('income')}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
            <span>+ Ingreso</span>
          </button>
          <button
            onClick={() => openAddModal('expense')}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por concepto o nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Type pills */}
        <div className="flex rounded-xl border border-slate-700/60 bg-slate-950 p-0.5">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-all ${
              typeFilter === 'all'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-all ${
              typeFilter === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-all ${
              typeFilter === 'expense'
                ? 'bg-rose-500/20 text-rose-300 font-bold'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            Egresos
          </button>
        </div>

        {/* Category selector */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions list */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Tag className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              No hay movimientos registrados para este filtro.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Agrega un ingreso o egreso para mantener la organización financiera.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filtered.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <div
                  key={t.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">
                          {t.concept}
                        </span>
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                          {CATEGORY_LABELS[t.category] || t.category}
                        </span>
                        {t.linkedPaymentId && (
                          <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 text-[10px] font-medium text-teal-300">
                            Cuota resuelta ✓
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t.date}
                        </span>
                        <span>•</span>
                        <span>{getMemberLabel(t.memberId)}</span>
                        <span>•</span>
                        <span className="capitalize">{t.paymentMethod}</span>
                      </div>
                      {t.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">
                          &ldquo;{t.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="text-right">
                      <p
                        className={`text-base font-bold ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {currencySymbol}
                        {formatAmount(t.amount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(t)}
                        aria-label={`Editar ${t.concept}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Modificar movimiento"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        aria-label={`Eliminar ${t.concept}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingTransaction ? 'Modificar Movimiento' : 'Registrar Nuevo Movimiento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    if (category === 'salario' || category === 'honorarios') {
                      setCategory('alimentacion');
                    }
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all border ${
                    type === 'expense'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-sm'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Egreso / Gasto</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    if (category === 'alimentacion' || category === 'vivienda') {
                      setCategory('salario');
                    }
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all border ${
                    type === 'income'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Ingreso</span>
                </button>
              </div>

              {/* Concept & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Concepto o Motivo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Supermercado, Factura Gas..."
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
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
              </div>

              {/* Category & Date */}
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
                    {type === 'expense' ? (
                      <>
                        <option value="alimentacion">Alimentación / Super</option>
                        <option value="vivienda">Vivienda / Alquiler</option>
                        <option value="servicios">Servicios Básicos</option>
                        <option value="transporte">Transporte / Gasolina</option>
                        <option value="salud">Salud y Farmacia</option>
                        <option value="educacion">Educación y Libros</option>
                        <option value="cuotas">Cuotas y Créditos</option>
                        <option value="ocio">Ocio y Salidas</option>
                        <option value="ahorro">Ahorro Familiar</option>
                        <option value="otros">Otros Gastos</option>
                      </>
                    ) : (
                      <>
                        <option value="salario">Salario / Nómina</option>
                        <option value="honorarios">Honorarios Freelance</option>
                        <option value="negocio">Negocio Propio</option>
                        <option value="renta">Renta / Rendimientos</option>
                        <option value="aporte_familiar">Aporte Familiar</option>
                        <option value="otros_ingresos">Otros Ingresos</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Member & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Asignado a
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="shared">🏡 Hogar (Compartido)</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        👤 {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="debito">Tarjeta Débito</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="credito">Tarjeta Crédito</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas adicionales (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Detalles sobre el gasto o comprobante..."
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
                  {editingTransaction ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
