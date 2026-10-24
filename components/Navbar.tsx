'use client';

import React, { useState } from 'react';
import {
  Home,
  Users,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Volume2,
  Calendar,
  X,
} from 'lucide-react';
import { HouseholdMember, HouseholdNotification } from '@/lib/finance-logic';
import { requestBrowserNotifications, sendBrowserNotification } from '@/lib/household-store';

interface NavbarProps {
  householdName: string;
  members: HouseholdMember[];
  activeMemberId: string | 'all';
  onSelectMember: (memberId: string | 'all') => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  notifications: HouseholdNotification[];
  onMarkNotificationRead: (id: string) => void;
  onOpenAdvisor: () => void;
  onOpenAddGoal?: () => void;
  onOpenCreateProfile?: () => void;
}

export function Navbar({
  householdName,
  members,
  activeMemberId,
  onSelectMember,
  selectedMonth,
  onSelectMonth,
  notifications,
  onMarkNotificationRead,
  onOpenAdvisor,
  onOpenAddGoal,
  onOpenCreateProfile,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifPermissionGranted, setNotifPermissionGranted] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleEnableNotifications = async () => {
    const granted = await requestBrowserNotifications();
    setNotifPermissionGranted(granted);
    if (granted) {
      sendBrowserNotification(
        '¡Notificaciones Activas!',
        'GASA objetivos te avisará de vencimientos y celebrará cada logro familiar.'
      );
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Home className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">GASA objetivos</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Gs. PYG
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Familia Galindo Salomon</p>
          </div>
        </div>

        {/* Center / Selector de Mes */}
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            <span>Periodo:</span>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium text-slate-200 border border-slate-700/60 focus:border-emerald-500 focus:outline-none"
            aria-label="Seleccionar mes de finanzas"
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Member Switcher */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/70 p-1 text-xs">
            <Users className="hidden sm:inline ml-1.5 h-3.5 w-3.5 text-slate-400" />
            <select
              value={activeMemberId}
              onChange={(e) => {
                if (e.target.value === 'new_profile') {
                  if (onOpenCreateProfile) onOpenCreateProfile();
                } else {
                  onSelectMember(e.target.value);
                }
              }}
              aria-label="Seleccionar vista por miembro del hogar"
              className="max-w-[115px] sm:max-w-none rounded-lg bg-transparent px-1.5 sm:px-2 py-1 font-medium text-slate-200 focus:outline-none cursor-pointer truncate"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                🏡 Hogar GASA (Todos)
              </option>
              {members.map((m) => {
                const isChild = m.role?.toLowerCase().includes('hijo');
                return (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                    {isChild ? '👦' : '👤'} {m.name} ({m.role}) {isChild ? '🛡️' : ''}
                  </option>
                );
              })}
              <option value="new_profile" className="bg-slate-900 text-emerald-400 font-bold">
                ➕ Crear Nuevo Perfil...
              </option>
            </select>
          </div>

          {/* Child Mode Active Badge */}
          {members.find((m) => m.id === activeMemberId)?.role?.toLowerCase().includes('hijo') && (
            <div className="hidden sm:flex items-center gap-1 rounded-xl bg-purple-500/10 border border-purple-500/30 px-2 py-1 text-[11px] font-semibold text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
              <span>Modo Hijo (Finanzas Protegidas)</span>
            </div>
          )}

          {/* Quick Create Profile Button */}
          {onOpenCreateProfile && (
            <button
              onClick={onOpenCreateProfile}
              aria-label="Crear nuevo perfil familiar"
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all"
            >
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>+ Perfil</span>
            </button>
          )}

          {/* Quick Add Goal button */}
          {onOpenAddGoal && (
            <button
              onClick={onOpenAddGoal}
              aria-label="Agregar nueva meta familiar"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/15 hover:opacity-95 transition-all"
            >
              <span className="text-sm font-black">+</span>
              <span className="hidden xs:inline">Meta</span>
            </button>
          )}

          {/* AI Coach / Consejero Familiar */}
          <button
            onClick={onOpenAdvisor}
            aria-label="Abrir Asesor Inteligente del Hogar"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline">Coach Positivo</span>
          </button>

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Ver notificaciones y recordatorios"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Avisos y Motivaciones</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    aria-label="Cerrar avisos"
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Browser permission button */}
                <div className="my-3 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center justify-between">
                  <div className="text-[11px] text-slate-300">
                    <p className="font-medium text-slate-200">Alertas en tu dispositivo</p>
                    <p className="text-slate-400">Recibe recordatorios de cuotas y ánimos.</p>
                  </div>
                  <button
                    onClick={handleEnableNotifications}
                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    {notifPermissionGranted ? 'Activo ✓' : 'Permitir'}
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">
                      No hay notificaciones por el momento. ¡Todo en orden!
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`rounded-xl border p-2.5 transition-colors cursor-pointer text-xs ${
                          n.read
                            ? 'border-slate-800/60 bg-slate-950/30 text-slate-400'
                            : 'border-emerald-500/20 bg-emerald-500/5 text-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === 'milestone' && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          {n.type === 'alert' && (
                            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          )}
                          {n.type === 'info' && (
                            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-semibold text-white">{n.title}</p>
                            <p className="text-[11px] text-slate-300 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
