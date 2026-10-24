'use client';

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  CreditCard,
  Clock,
  Target,
  PiggyBank,
  Users,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  PieChart,
  ShoppingCart,
  Shield,
  Store,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { MetricCards } from '@/components/MetricCards';
import { MotivationalBanner } from '@/components/MotivationalBanner';
import { TransactionsView } from '@/components/TransactionsView';
import { PendingPaymentsView } from '@/components/PendingPaymentsView';
import { SavingsGoalsView } from '@/components/SavingsGoalsView';
import { MembersView } from '@/components/MembersView';
import { MonthlyBudgetView } from '@/components/MonthlyBudgetView';
import { SupermarketView } from '@/components/SupermarketView';
import { ChildRestrictedView } from '@/components/ChildRestrictedView';
import { AiAdvisorModal } from '@/components/AiAdvisorModal';
import { CelebrationModal } from '@/components/CelebrationModal';
import { CreateProfileModal } from '@/components/CreateProfileModal';
import {
  HouseholdState,
  loadHouseholdState,
  saveHouseholdState,
  INITIAL_HOUSEHOLD_DATA,
  sendBrowserNotification,
} from '@/lib/household-store';
import {
  calculateMonthlySummary,
  calculateMemberBreakdown,
  checkGoalMilestones,
  getMotivationalMessage,
  formatAmount,
  Transaction,
  PendingPayment,
  SavingsGoal,
  MonthlyBudget,
  HouseholdMember,
  SupermarketItem,
  isChildRole,
  calculateSupermarketTotals,
} from '@/lib/finance-logic';
import { playSuccessChime, playMilestoneFanfare } from '@/lib/sound-fx';
import { generateUniqueId } from '@/lib/utils';

type TabType =
  | 'dashboard'
  | 'supermarket'
  | 'transactions'
  | 'payments'
  | 'goals'
  | 'budget'
  | 'members';

export default function HomePage() {
  const [state, setState] = useState<HouseholdState>(INITIAL_HOUSEHOLD_DATA);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [openGoalCreateTrigger, setOpenGoalCreateTrigger] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    emoji: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    emoji: '🎉',
  });
  const [bannerAlert, setBannerAlert] = useState<{
    title: string;
    message: string;
    emoji: string;
  } | null>(null);

  // Load state on client mount to avoid hydration discrepancy
  useEffect(() => {
    const loaded = loadHouseholdState();
    setState(loaded);
  }, []);

  // Sync state to localStorage whenever it changes
  const updateState = (newState: HouseholdState | ((prev: HouseholdState) => HouseholdState)) => {
    setState((prev) => {
      const updated = typeof newState === 'function' ? newState(prev) : newState;
      saveHouseholdState(updated);
      return updated;
    });
  };

  // Trigger celebration visual & sound
  const fireCelebration = (title: string, message: string, emoji = '🎉', isMilestone = false) => {
    if (isMilestone) {
      playMilestoneFanfare();
    } else {
      playSuccessChime();
    }

    if (typeof window !== 'undefined') {
      confetti({
        particleCount: isMilestone ? 120 : 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    setCelebrationData({
      isOpen: true,
      title,
      message,
      emoji,
    });

    setBannerAlert({
      title,
      message,
      emoji,
    });

    sendBrowserNotification(title, message);
  };

  const handleOpenAddGoal = () => {
    setActiveTab('goals');
    setOpenGoalCreateTrigger(true);
  };

  // Add in-app notification
  const addNotification = (
    title: string,
    message: string,
    type: 'success' | 'alert' | 'info' | 'milestone'
  ) => {
    const newNotif = {
      id: generateUniqueId('notif'),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };
    updateState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications].slice(0, 30),
    }));
  };

  // Monthly summary calculations (filtered by active member profile if selected)
  const summary = useMemo(() => {
    return calculateMonthlySummary(
      state.transactions,
      state.payments,
      state.selectedMonth,
      '2026-10-24',
      state.activeMemberId
    );
  }, [state.transactions, state.payments, state.selectedMonth, state.activeMemberId]);

  // Total household collective summary (pools all incomes across every member)
  const householdSummary = useMemo(() => {
    return calculateMonthlySummary(
      state.transactions,
      state.payments,
      state.selectedMonth,
      '2026-10-24',
      'all'
    );
  }, [state.transactions, state.payments, state.selectedMonth]);

  const currentMember = useMemo(() => {
    if (state.activeMemberId === 'all') return null;
    return state.members.find((m) => m.id === state.activeMemberId) || null;
  }, [state.members, state.activeMemberId]);

  // Breakdown by member
  const memberBreakdown = useMemo(() => {
    return calculateMemberBreakdown(
      state.transactions,
      state.members,
      state.selectedMonth
    );
  }, [state.transactions, state.members, state.selectedMonth]);

  // Role permissions check
  const isChild = useMemo(() => {
    return isChildRole(currentMember?.role);
  }, [currentMember]);

  const pendingSupermarketCount = useMemo(() => {
    return (state.supermarketItems || []).filter((i) => !i.purchased).length;
  }, [state.supermarketItems]);

  const childSupermarketCount = useMemo(() => {
    if (!currentMember) return 0;
    return (state.supermarketItems || []).filter(
      (i) => i.requestedByMemberId === currentMember.id
    ).length;
  }, [state.supermarketItems, currentMember]);

  // --- Handlers: Supermarket & Despensa ---
  const handleAddSupermarketItem = (newItem: Omit<SupermarketItem, 'id' | 'addedDate'>) => {
    const item: SupermarketItem = {
      ...newItem,
      id: generateUniqueId('sm'),
      addedDate: '2026-10-24',
    };
    updateState((prev) => ({
      ...prev,
      supermarketItems: [item, ...(prev.supermarketItems || [])],
    }));
    const requester =
      state.members.find((m) => m.id === item.requestedByMemberId)?.name || 'Un miembro';
    addNotification(
      'Nuevo Producto para el Súper',
      `${requester} agregó "${item.name}" a la lista del supermercado.`,
      'info'
    );
  };

  const handleUpdateSupermarketItem = (updatedItem: SupermarketItem) => {
    updateState((prev) => ({
      ...prev,
      supermarketItems: (prev.supermarketItems || []).map((i) =>
        i.id === updatedItem.id ? updatedItem : i
      ),
    }));
  };

  const handleDeleteSupermarketItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      supermarketItems: (prev.supermarketItems || []).filter((i) => i.id !== id),
    }));
  };

  const handleConvertSupermarketCartToExpense = (
    purchasedItems: SupermarketItem[],
    totalAmount: number
  ) => {
    const todayStr = '2026-10-24';
    const newTx: Transaction = {
      id: generateUniqueId('tx'),
      concept: `Supermercado Familiar GASA (${purchasedItems.length} artículos)`,
      amount: totalAmount,
      type: 'expense',
      category: 'alimentacion',
      date: todayStr,
      memberId: 'shared',
      paymentMethod: 'debito',
      notes: `Compra de canasta despensa con precios de referencia de comprador.digital: ${purchasedItems
        .map((i) => i.name)
        .slice(0, 3)
        .join(', ')}${purchasedItems.length > 3 ? '...' : ''}.`,
    };

    updateState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      supermarketItems: (prev.supermarketItems || []).filter((i) => !i.purchased),
    }));

    const title = '¡Compra del Súper Asentada al Hogar!';
    const message = `Se registró el egreso de ${state.currencySymbol}${formatAmount(
      totalAmount
    )} en Alimentación. ¡La despensa de la Familia Galindo Salomon está completa!`;
    addNotification(title, message, 'success');
    fireCelebration(title, message, '🛒', false);
  };

  // --- Handlers: Transactions ---
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: generateUniqueId('tx'),
    };
    updateState((prev) => ({
      ...prev,
      transactions: [tx, ...prev.transactions],
    }));

    if (tx.type === 'income') {
      addNotification('Nuevo Ingreso GASA', `Se registraron ${state.currencySymbol}${formatAmount(tx.amount)} por "${tx.concept}".`, 'success');
    }
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    updateState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t)),
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    updateState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  // --- Handlers: Pending Payments / Cuotas ---
  const handleAddPayment = (newPay: Omit<PendingPayment, 'id'>) => {
    const payment: PendingPayment = {
      ...newPay,
      id: generateUniqueId('pay'),
    };
    updateState((prev) => ({
      ...prev,
      payments: [payment, ...prev.payments],
    }));
    addNotification('Nuevo Vencimiento GASA', `Programado "${payment.title}" para el ${payment.dueDate}.`, 'info');
  };

  const handleUpdatePayment = (updatedPay: PendingPayment) => {
    updateState((prev) => ({
      ...prev,
      payments: prev.payments.map((p) => (p.id === updatedPay.id ? updatedPay : p)),
    }));
  };

  const handleDeletePayment = (id: string) => {
    updateState((prev) => ({
      ...prev,
      payments: prev.payments.filter((p) => p.id !== id),
    }));
  };

  // MARK PAYMENT AS PAID WITH 1-CLICK & POSITIVE MOTIVATION
  const handleMarkPaymentPaid = (payment: PendingPayment, createExpense: boolean) => {
    const todayStr = '2026-10-24';
    const memberName = state.members.find((m) => m.id === payment.assignedMemberId)?.name;

    const motivational = getMotivationalMessage('payment_settled', {
      title: payment.title,
      amount: payment.amount,
      memberName,
    });

    updateState((prev) => {
      let updatedTx = prev.transactions;
      if (createExpense) {
        const newTx: Transaction = {
          id: generateUniqueId('tx'),
          concept: `Pago de cuota: ${payment.title}`,
          amount: payment.amount,
          type: 'expense',
          category: payment.category,
          date: todayStr,
          memberId: payment.assignedMemberId,
          paymentMethod: 'debito',
          linkedPaymentId: payment.id,
          notes: `Pago registrado automáticamente al resolver la cuota.`,
        };
        updatedTx = [newTx, ...updatedTx];
      }

      const updatedPayments = prev.payments.map((p) =>
        p.id === payment.id
          ? { ...p, isPaid: true, paidDate: todayStr }
          : p
      );

      return {
        ...prev,
        transactions: updatedTx,
        payments: updatedPayments,
      };
    });

    addNotification(motivational.title, motivational.message, 'milestone');
    fireCelebration(motivational.title, motivational.message, motivational.emoji, false);
  };

  const handleToggleUnpaid = (id: string) => {
    updateState((prev) => ({
      ...prev,
      payments: prev.payments.map((p) =>
        p.id === id ? { ...p, isPaid: false, paidDate: undefined } : p
      ),
    }));
  };

  // --- Handlers: Savings Goals & Milestones ---
  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id' | 'lastMilestoneAcknowledged'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: generateUniqueId('goal'),
      lastMilestoneAcknowledged: 0,
    };
    updateState((prev) => ({
      ...prev,
      goals: [...prev.goals, goal],
    }));
    addNotification('Nueva Meta GASA', `¡La Familia Galindo Salomon se propone alcanzar "${goal.title}"!`, 'info');
  };

  const handleUpdateGoal = (updatedGoal: SavingsGoal) => {
    updateState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
    }));
  };

  const handleDeleteGoal = (id: string) => {
    updateState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const handleDepositToGoal = (goalId: string, amount: number) => {
    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal) return;

    const prevAmount = goal.currentAmount;
    const newAmount = prevAmount + amount;
    const milestoneCrossed = checkGoalMilestones(
      prevAmount,
      newAmount,
      goal.targetAmount,
      goal.lastMilestoneAcknowledged || 0
    );

    updateState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: newAmount,
              lastMilestoneAcknowledged: milestoneCrossed || g.lastMilestoneAcknowledged,
            }
          : g
      ),
    }));

    if (milestoneCrossed) {
      const motivational = getMotivationalMessage('goal_milestone', {
        title: goal.title,
        milestone: milestoneCrossed,
      });
      addNotification(motivational.title, motivational.message, 'milestone');
      fireCelebration(motivational.title, motivational.message, motivational.emoji, true);
    } else {
      const depositMsg = getMotivationalMessage('savings_deposit', {
        title: goal.title,
        amount,
      });
      addNotification(depositMsg.title, depositMsg.message, 'success');
      playSuccessChime();
      setBannerAlert({
        title: depositMsg.title,
        message: depositMsg.message,
        emoji: '💎',
      });
    }
  };

  // --- Handlers: Members ---
  const handleAddMember = (newMem: Omit<HouseholdMember, 'id'>) => {
    const newId = generateUniqueId('m');
    const member: HouseholdMember = {
      ...newMem,
      id: newId,
    };
    updateState((prev) => ({
      ...prev,
      members: [...prev.members, member],
      activeMemberId: newId, // Immediately switch to newly created profile
    }));
    addNotification('Nuevo Perfil Familiar GASA', `¡Bienvenido(a) ${member.name}! Ya tienes tu perfil activo para anotar tus ingresos y metas familiares.`, 'success');
    fireCelebration(
      '¡Perfil Creado con Éxito!',
      `Bienvenido ${member.name}. Todos los ingresos que anotes en tu perfil se sumarán automáticamente al pozo colectivo del Hogar.`,
      '🎉',
      false
    );
  };

  const handleUpdateMember = (updatedMem: HouseholdMember) => {
    updateState((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === updatedMem.id ? updatedMem : m)),
    }));
  };

  const handleDeleteMember = (id: string) => {
    updateState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
      activeMemberId: prev.activeMemberId === id ? 'all' : prev.activeMemberId,
    }));
  };

  // --- Handlers: Budgets ---
  const handleUpdateBudgets = (newBudgets: MonthlyBudget[]) => {
    updateState((prev) => ({
      ...prev,
      budgets: newBudgets,
    }));
    addNotification('Presupuesto Actualizado', 'Se ajustaron las metas mensuales por categoría en Guaraníes.', 'info');
  };

  // --- Reset to Demo Data ---
  const handleResetDemoData = () => {
    if (confirm('¿Deseas restaurar los datos iniciales de la Familia Galindo Salomon?')) {
      updateState(INITIAL_HOUSEHOLD_DATA);
      setBannerAlert(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        householdName={state.householdName}
        members={state.members}
        activeMemberId={state.activeMemberId}
        onSelectMember={(id) => updateState((prev) => ({ ...prev, activeMemberId: id }))}
        selectedMonth={state.selectedMonth}
        onSelectMonth={(m) => updateState((prev) => ({ ...prev, selectedMonth: m }))}
        notifications={state.notifications}
        onMarkNotificationRead={(id) =>
          updateState((prev) => ({
            ...prev,
            notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
          }))
        }
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenAddGoal={handleOpenAddGoal}
        onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Motivational Banner */}
        <MotivationalBanner
          bannerData={bannerAlert}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
          onDismiss={() => setBannerAlert(null)}
        />

        {/* Global Summary Cards (supports individual profile vs total pooled household) */}
        <MetricCards
          summary={summary}
          householdTotalIncome={householdSummary.totalIncome}
          currencySymbol={state.currencySymbol}
          isIndividualProfile={state.activeMemberId !== 'all'}
          isChildProfile={isChild}
          childSupermarketCount={childSupermarketCount}
          activeMemberName={currentMember?.name}
          onNavigateToTab={(tab) => setActiveTab(tab as TabType)}
        />

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-1 scrollbar-none border-b border-slate-800 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'dashboard'
                ? 'border-emerald-400 text-white bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-emerald-400" />
            <span>Panel General</span>
          </button>

          {/* Supermarket Tab */}
          <button
            onClick={() => setActiveTab('supermarket')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'supermarket'
                ? 'border-emerald-400 text-white bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <ShoppingCart className="h-4 w-4 text-emerald-400" />
            <span>Lista del Supermercado</span>
            {pendingSupermarketCount > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                {pendingSupermarketCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'transactions'
                ? 'border-emerald-400 text-white bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <CreditCard className="h-4 w-4 text-emerald-400" />
            <span>Ingresos y Egresos</span>
            {isChild && <span className="text-[10px] text-purple-400 ml-0.5">🔒</span>}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'payments'
                ? 'border-amber-400 text-white bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Cuotas y Vencimientos</span>
            {isChild ? (
              <span className="text-[10px] text-purple-400 ml-0.5">🔒</span>
            ) : (
              summary.urgentPaymentsCount > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  {summary.urgentPaymentsCount}
                </span>
              )
            )}
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'goals'
                ? 'border-emerald-400 text-white bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Target className="h-4 w-4 text-teal-400" />
            <span>Metas de Ahorro</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'budget'
                ? 'border-emerald-400 text-white bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <PieChart className="h-4 w-4 text-cyan-400" />
            <span>Presupuesto Mensual</span>
            {isChild && <span className="text-[10px] text-purple-400 ml-0.5">🔒</span>}
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'members'
                ? 'border-emerald-400 text-white bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Users className="h-4 w-4 text-indigo-400" />
            <span>Miembros GASA ({state.members.length})</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Actions & Urgent Payment Alert */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left 2 Cols: Mode child shows supermarket requests & collaboration; parent mode shows adult bills */}
              {isChild ? (
                <div className="lg:col-span-2 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-900/80 to-slate-900/60 p-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">
                        Tus Pedidos de Supermercado & Tareas del Hogar
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('supermarket')}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:underline"
                    >
                      <span>Ver lista completa</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {(state.supermarketItems || [])
                      .filter((i) => i.requestedByMemberId === currentMember?.id)
                      .slice(0, 3).length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        <p>No tienes productos pedidos actualmente en la lista del supermercado.</p>
                        <button
                          onClick={() => setActiveTab('supermarket')}
                          className="mt-2 text-emerald-400 font-semibold hover:underline"
                        >
                          + Pedir algo para la despensa o merienda
                        </button>
                      </div>
                    ) : (
                      (state.supermarketItems || [])
                        .filter((i) => i.requestedByMemberId === currentMember?.id)
                        .slice(0, 3)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs"
                          >
                            <div>
                              <p className="font-bold text-white">{item.name}</p>
                              <p className="text-slate-400 text-[11px]">
                                Cantidad: {item.quantity} {item.unit} • Est.: {state.currencySymbol}
                                {formatAmount(item.estimatedPrice * item.quantity)}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                item.purchased
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {item.purchased ? 'En Carrito' : 'Pendiente'}
                            </span>
                          </div>
                        ))
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-purple-300">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Las cuotas y facturas de servicios están administradas por tus padres.</span>
                    </span>
                    <button
                      onClick={() => setActiveTab('supermarket')}
                      className="text-emerald-400 hover:underline font-semibold"
                    >
                      Ir a Supermercado →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">
                        Próximos Vencimientos - Familia Galindo Salomon
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:underline"
                    >
                      <span>Ver todos</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="mt-4 divide-y divide-slate-800/60">
                    {state.payments.filter((p) => !p.isPaid).slice(0, 3).length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        ¡No hay cuotas pendientes para este periodo! El hogar Galindo Salomon está al día.
                      </div>
                    ) : (
                      state.payments
                        .filter((p) => !p.isPaid)
                        .slice(0, 3)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between py-3 gap-2"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">{p.title}</p>
                              <p className="text-xs text-slate-400">
                                Vence el {p.dueDate} • {state.currencySymbol}{formatAmount(p.amount)}
                              </p>
                            </div>

                            <button
                              onClick={() => handleMarkPaymentPaid(p, true)}
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Pagar</span>
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* Right Col: Estado de Metas Familiares */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-teal-400" />
                      <h3 className="text-sm font-bold text-white">
                        GASA Objetivos en Progreso
                      </h3>
                    </div>
                    <button
                      onClick={handleOpenAddGoal}
                      className="flex items-center gap-1 text-xs font-semibold text-teal-400 hover:underline"
                    >
                      <Plus className="h-3 w-3" />
                      <span>+ Nueva Meta</span>
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {state.goals.slice(0, 2).map((g) => {
                      const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                      return (
                        <div key={g.id} className="text-xs">
                          <div className="flex justify-between font-semibold text-slate-200 mb-1">
                            <span className="line-clamp-1">{g.title}</span>
                            <span className="text-teal-400 font-bold">{pct}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                            <span>{state.currencySymbol}{formatAmount(g.currentAmount)}</span>
                            <span>Meta: {state.currencySymbol}{formatAmount(g.targetAmount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={handleOpenAddGoal}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/15 hover:opacity-95 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Agregar Meta</span>
                  </button>
                  <button
                    onClick={() => setIsAdvisorOpen(true)}
                    className="flex items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
                    title="Coach Financiero"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Aportes y Gastos por Miembro */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>Colaboración Familia Galindo Salomon ({state.selectedMonth})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {memberBreakdown.map((item) => (
                  <div
                    key={item.member.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-sm">
                        {item.member.name}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-400">
                      <div className="flex justify-between">
                        <span>Ingresos aportados:</span>
                        <strong className="text-emerald-400">
                          {isChild && item.member.id !== currentMember?.id
                            ? 'Protegido 🔒'
                            : `${state.currencySymbol}${formatAmount(item.totalIncome)}`}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Gastos registrados:</span>
                        <strong className="text-slate-200">
                          {isChild && item.member.id !== currentMember?.id
                            ? 'Protegido 🔒'
                            : `${state.currencySymbol}${formatAmount(item.totalExpenses)}`}
                        </strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800/80">
                        <span>% del ingreso familiar:</span>
                        <strong className="text-teal-300">
                          {isChild && item.member.id !== currentMember?.id
                            ? 'Familiar'
                            : `${item.contributionPercent}%`}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Supermarket Tab View */}
        {activeTab === 'supermarket' && (
          <SupermarketView
            items={state.supermarketItems || []}
            members={state.members}
            currencySymbol={state.currencySymbol}
            activeMemberId={state.activeMemberId}
            onAddItem={handleAddSupermarketItem}
            onUpdateItem={handleUpdateSupermarketItem}
            onDeleteItem={handleDeleteSupermarketItem}
            onConvertToExpense={handleConvertSupermarketCartToExpense}
          />
        )}

        {/* Transactions Tab View (Protected if child) */}
        {activeTab === 'transactions' &&
          (isChild ? (
            <ChildRestrictedView
              currentMember={currentMember!}
              sectionTitle="Ingresos y Egresos Familiares"
              members={state.members}
              onSelectMember={(id) => updateState((prev) => ({ ...prev, activeMemberId: id }))}
              onNavigateToTab={(tab) => setActiveTab(tab as TabType)}
            />
          ) : (
            <TransactionsView
              transactions={state.transactions}
              members={state.members}
              currencySymbol={state.currencySymbol}
              selectedMonth={state.selectedMonth}
              activeMemberId={state.activeMemberId}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          ))}

        {/* Payments Tab View (Protected if child) */}
        {activeTab === 'payments' &&
          (isChild ? (
            <ChildRestrictedView
              currentMember={currentMember!}
              sectionTitle="Cuotas y Vencimientos Adultos"
              members={state.members}
              onSelectMember={(id) => updateState((prev) => ({ ...prev, activeMemberId: id }))}
              onNavigateToTab={(tab) => setActiveTab(tab as TabType)}
            />
          ) : (
            <PendingPaymentsView
              payments={state.payments}
              members={state.members}
              currencySymbol={state.currencySymbol}
              selectedMonth={state.selectedMonth}
              activeMemberId={state.activeMemberId}
              onAddPayment={handleAddPayment}
              onUpdatePayment={handleUpdatePayment}
              onDeletePayment={handleDeletePayment}
              onMarkPaid={handleMarkPaymentPaid}
              onToggleUnpaid={handleToggleUnpaid}
            />
          ))}

        {/* Goals Tab View */}
        {activeTab === 'goals' && (
          <SavingsGoalsView
            goals={state.goals}
            currencySymbol={state.currencySymbol}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onDepositToGoal={handleDepositToGoal}
            openCreateModalTrigger={openGoalCreateTrigger}
            onResetCreateModalTrigger={() => setOpenGoalCreateTrigger(false)}
          />
        )}

        {/* Monthly Budget Tab View (Protected if child) */}
        {activeTab === 'budget' &&
          (isChild ? (
            <ChildRestrictedView
              currentMember={currentMember!}
              sectionTitle="Presupuesto Mensual del Hogar"
              members={state.members}
              onSelectMember={(id) => updateState((prev) => ({ ...prev, activeMemberId: id }))}
              onNavigateToTab={(tab) => setActiveTab(tab as TabType)}
            />
          ) : (
            <MonthlyBudgetView
              budgets={state.budgets}
              transactions={state.transactions}
              currencySymbol={state.currencySymbol}
              selectedMonth={state.selectedMonth}
              onUpdateBudgets={handleUpdateBudgets}
            />
          ))}

        {/* Members View */}
        {activeTab === 'members' && (
          <MembersView
            members={state.members}
            transactions={state.transactions}
            currencySymbol={state.currencySymbol}
            selectedMonth={state.selectedMonth}
            activeMemberId={state.activeMemberId}
            onSelectMember={(id) => updateState((prev) => ({ ...prev, activeMemberId: id }))}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            GASA objetivos © 2026 — Familia Galindo Salomon. Gestión y bienestar financiero.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDemoData}
              className="text-slate-400 hover:text-slate-200 underline underline-offset-2"
            >
              Restaurar datos de ejemplo
            </button>
          </div>
        </div>
      </footer>

      {/* Create Profile Modal */}
      <CreateProfileModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        currencySymbol={state.currencySymbol}
        onAddMember={handleAddMember}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData((prev) => ({ ...prev, isOpen: false }))}
        title={celebrationData.title}
        message={celebrationData.message}
        emoji={celebrationData.emoji}
      />

      {/* AI Financial Coach Modal */}
      <AiAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        summary={summary}
        goals={state.goals}
        payments={state.payments}
        members={state.members}
      />
    </div>
  );
}
