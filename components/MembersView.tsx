'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ShieldCheck,
  Heart,
  TrendingUp,
  Wallet,
  X,
  User,
  GraduationCap,
  Smile,
  Briefcase,
} from 'lucide-react';
import { HouseholdMember, Transaction, formatAmount } from '@/lib/finance-logic';

interface MembersViewProps {
  members: HouseholdMember[];
  transactions: Transaction[];
  currencySymbol: string;
  selectedMonth: string;
  activeMemberId?: string | 'all';
  onSelectMember?: (id: string | 'all') => void;
  onAddMember: (member: Omit<HouseholdMember, 'id'>) => void;
  onUpdateMember: (member: HouseholdMember) => void;
  onDeleteMember: (id: string) => void;
}

const AVATAR_COLORS = [
  { label: 'Esmeralda', value: 'from-emerald-500 to-teal-600' },
  { label: 'Azul Índigo', value: 'from-blue-500 to-indigo-600' },
  { label: 'Púrpura Rosa', value: 'from-purple-500 to-pink-600' },
  { label: 'Ámbar Naranja', value: 'from-amber-500 to-orange-600' },
  { label: 'Cian Turquesa', value: 'from-cyan-500 to-blue-500' },
  { label: 'Rosa Rubí', value: 'from-rose-500 to-pink-600' },
];

export function MembersView({
  members,
  transactions,
  currencySymbol,
  selectedMonth,
  activeMemberId,
  onSelectMember,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}: MembersViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<HouseholdMember['role']>('Padre');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].value);
  const [monthlyContributionGoal, setMonthlyContributionGoal] = useState('');

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setRole('Padre');
    setAvatarColor(AVATAR_COLORS[0].value);
    setMonthlyContributionGoal('2000000');
    setIsModalOpen(true);
  };

  const openEditModal = (m: HouseholdMember) => {
    setEditingMember(m);
    setName(m.name);
    setRole(m.role);
    setAvatarColor(m.avatarColor);
    setMonthlyContributionGoal(m.monthlyContributionGoal.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const goal = parseFloat(monthlyContributionGoal) || 0;

    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        name: name.trim(),
        role,
        avatarColor,
        monthlyContributionGoal: goal,
      });
    } else {
      onAddMember({
        name: name.trim(),
        role,
        avatarColor,
        avatarIcon: 'User',
        monthlyContributionGoal: goal,
      });
    }

    setIsModalOpen(false);
  };

  const monthTx = transactions.filter((t) => t.date.startsWith(selectedMonth));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Miembros y Usuarios del Hogar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Crea y administra los integrantes de la familia, sus roles y sus aportes mensuales.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
        >
          <UserPlus className="h-4 w-4 stroke-[2.5]" />
          <span>+ Agregar Miembro</span>
        </button>
      </div>

      {/* Grid of members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((member) => {
          const memberIncome = monthTx
            .filter((t) => t.memberId === member.id && t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

          const memberExpenses = monthTx
            .filter((t) => t.memberId === member.id && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

          return (
            <div
              key={member.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${member.avatarColor} text-white shadow-md`}
                  >
                    <User className="h-6 w-6 stroke-[2]" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(member)}
                      aria-label={`Editar ${member.name}`}
                      className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {members.length > 1 && (
                      <button
                        onClick={() => onDeleteMember(member.id)}
                        aria-label={`Eliminar ${member.name}`}
                        className="rounded-lg p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-white text-base">
                    {member.name}
                  </h3>
                  <span className="inline-block mt-0.5 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    {member.role}
                  </span>
                </div>

                {/* Financial stats */}
                <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Aporte este mes:</span>
                    <strong className="text-emerald-400">
                      {currencySymbol}{formatAmount(memberIncome)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Gastos asignados:</span>
                    <strong className="text-slate-200">
                      {currencySymbol}{formatAmount(memberExpenses)}
                    </strong>
                  </div>

                  {member.monthlyContributionGoal > 0 && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Meta mensual esperada:</span>
                      <strong className="text-slate-300">
                        {currencySymbol}{formatAmount(member.monthlyContributionGoal)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Profile switch action */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {activeMemberId === member.id ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      ✓ Perfil Activo
                    </span>
                  ) : (
                    onSelectMember && (
                      <button
                        onClick={() => onSelectMember(member.id)}
                        className="text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all"
                      >
                        Ver Perfil →
                      </button>
                    )
                  )}
                  <span className="text-[10px] text-slate-500">
                    Suma al Hogar
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingMember ? 'Modificar Usuario del Hogar' : 'Crear Nuevo Integrante Familiar'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre Completo o Apodo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Laura, David, Sofía..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Rol en el Hogar
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Roommate">Roommate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Meta de Aporte ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={monthlyContributionGoal}
                    onChange={(e) => setMonthlyContributionGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Color Identificador
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setAvatarColor(c.value)}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-xs transition-all ${
                        avatarColor === c.value
                          ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <span className={`h-3 w-3 rounded-full bg-gradient-to-tr ${c.value}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95"
                >
                  {editingMember ? 'Guardar Cambios' : 'Agregar Integrante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
