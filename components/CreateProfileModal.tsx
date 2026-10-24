'use client';

import React, { useState } from 'react';
import { UserPlus, User, X, Sparkles, Check, Heart } from 'lucide-react';
import { HouseholdMember } from '@/lib/finance-logic';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onAddMember: (member: Omit<HouseholdMember, 'id'>) => void;
}

const AVATAR_COLORS = [
  { label: 'Esmeralda', value: 'from-emerald-500 to-teal-600' },
  { label: 'Azul Índigo', value: 'from-blue-500 to-indigo-600' },
  { label: 'Púrpura Rosa', value: 'from-purple-500 to-pink-600' },
  { label: 'Ámbar Naranja', value: 'from-amber-500 to-orange-600' },
  { label: 'Cian Turquesa', value: 'from-cyan-500 to-blue-500' },
  { label: 'Rosa Rubí', value: 'from-rose-500 to-pink-600' },
];

export function CreateProfileModal({
  isOpen,
  onClose,
  currencySymbol,
  onAddMember,
}: CreateProfileModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<HouseholdMember['role']>('Hijo/a');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].value);
  const [monthlyContributionGoal, setMonthlyContributionGoal] = useState('1000000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const goal = parseFloat(monthlyContributionGoal) || 0;

    onAddMember({
      name: name.trim(),
      role,
      avatarColor,
      avatarIcon: 'User',
      monthlyContributionGoal: goal,
    });

    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-indigo-500/40 bg-slate-900 p-6 sm:p-7 shadow-2xl">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Crear Perfil en GASA
              </h3>
              <p className="text-xs text-slate-400">
                Familia Galindo Salomon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal de crear perfil"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info card */}
        <div className="my-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-emerald-200/90 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-300 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Colaboración del Hogar:</span>
          </div>
          Todos los ingresos que anotes en tu perfil personal se sumarán automáticamente al pozo colectivo familiar cuando selecciones la vista <strong>Hogar</strong>.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nombre o Apodo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Lucas Galindo, Tía Rosa, Carlos..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Rol Familiar
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Padre">Padre</option>
                <option value="Madre">Madre</option>
                <option value="Hijo/a">Hijo/a</option>
                <option value="Familiar">Familiar</option>
                <option value="Administrador">Administrador</option>
                <option value="Roommate">Roommate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Aporte Mensual Meta ({currencySymbol})
              </label>
              <input
                type="number"
                step="50000"
                min="0"
                placeholder="1000000"
                value={monthlyContributionGoal}
                onChange={(e) => setMonthlyContributionGoal(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Color Distintivo del Perfil
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setAvatarColor(c.value)}
                  className={`flex items-center gap-1.5 rounded-xl border p-2 text-[11px] transition-all ${
                    avatarColor === c.value
                      ? 'border-indigo-500 bg-indigo-500/15 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full bg-gradient-to-tr ${c.value}`} />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
            >
              Crear Perfil y Activar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
