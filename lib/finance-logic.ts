export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'vivienda'
  | 'alimentacion'
  | 'servicios'
  | 'transporte'
  | 'salud'
  | 'educacion'
  | 'cuotas'
  | 'ocio'
  | 'ahorro'
  | 'otros';

export type IncomeCategory =
  | 'salario'
  | 'honorarios'
  | 'negocio'
  | 'renta'
  | 'aporte_familiar'
  | 'otros_ingresos';

export type SupermarketCategory =
  | 'almacen'
  | 'lacteos_huevos'
  | 'carniceria_pollo'
  | 'verduras_frutas'
  | 'panaderia'
  | 'limpieza'
  | 'higiene'
  | 'bebidas'
  | 'otros';

export interface SupermarketItem {
  id: string;
  name: string;
  category: SupermarketCategory;
  quantity: number;
  unit: 'unid' | 'kg' | 'litro' | 'paquete' | 'g' | 'docena' | string;
  estimatedPrice: number; // Precio unitario estimado en Gs.
  purchased: boolean;
  requestedByMemberId: string;
  notes?: string;
  addedDate: string; // YYYY-MM-DD
  isReferencePrice?: boolean; // Proveniente de referencia de comprador.digital
  compradorDigitalSlug?: string;
}

export interface SupermarketTotals {
  totalEstimatedPending: number;
  totalEstimatedPurchased: number;
  totalEstimatedAll: number;
  totalItemsCount: number;
  pendingCount: number;
  purchasedCount: number;
}

export interface RolePermissions {
  canViewFinances: boolean; // ver salarios, deudas adultas, pozo global
  canModifyFinances: boolean; // editar/borrar transacciones, presupuestos, pagos
  canViewSupermarket: boolean;
  canAddSupermarketItems: boolean;
  canMarkSupermarketPurchased: boolean;
  canConvertSupermarketToExpense: boolean;
  canViewGoals: boolean;
  canContributeToGoals: boolean;
}

export function isChildRole(role?: string): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return (
    normalized === 'hijo' ||
    normalized === 'hija' ||
    normalized === 'hijo/a' ||
    normalized.includes('hijo')
  );
}

export function isParentOrAdmin(role?: string): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return (
    normalized === 'administrador' ||
    normalized === 'padre' ||
    normalized === 'madre' ||
    normalized === 'admin'
  );
}

export function getRolePermissions(role?: string): RolePermissions {
  if (isChildRole(role)) {
    return {
      canViewFinances: false,
      canModifyFinances: false,
      canViewSupermarket: true,
      canAddSupermarketItems: true,
      canMarkSupermarketPurchased: true,
      canConvertSupermarketToExpense: false,
      canViewGoals: true,
      canContributeToGoals: true,
    };
  }

  return {
    canViewFinances: true,
    canModifyFinances: true,
    canViewSupermarket: true,
    canAddSupermarketItems: true,
    canMarkSupermarketPurchased: true,
    canConvertSupermarketToExpense: true,
    canViewGoals: true,
    canContributeToGoals: true,
  };
}

export function calculateSupermarketTotals(items: SupermarketItem[]): SupermarketTotals {
  let totalEstimatedPending = 0;
  let totalEstimatedPurchased = 0;
  let pendingCount = 0;
  let purchasedCount = 0;

  for (const item of items) {
    const subtotal = Math.round(item.estimatedPrice * (item.quantity || 1));
    if (item.purchased) {
      totalEstimatedPurchased += subtotal;
      purchasedCount++;
    } else {
      totalEstimatedPending += subtotal;
      pendingCount++;
    }
  }

  return {
    totalEstimatedPending,
    totalEstimatedPurchased,
    totalEstimatedAll: totalEstimatedPending + totalEstimatedPurchased,
    totalItemsCount: items.length,
    pendingCount,
    purchasedCount,
  };
}

export interface HouseholdMember {
  id: string;
  name: string;
  role: 'Administrador' | 'Padre' | 'Madre' | 'Hijo/a' | 'Familiar' | 'Roommate';
  avatarColor: string;
  avatarIcon: string;
  monthlyContributionGoal: number; // Aporte esperado mensual en ₲
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  concept: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory | string;
  date: string; // YYYY-MM-DD
  memberId: string; // ID del miembro o 'shared' para pozo común
  paymentMethod: 'efectivo' | 'debito' | 'credito' | 'transferencia' | 'otro';
  notes?: string;
  isRecurring?: boolean;
  linkedPaymentId?: string; // Si provino de un recordatorio de cuota
}

export type PaymentUrgency = 'overdue' | 'due_today' | 'due_soon' | 'upcoming' | 'paid';

export interface PendingPayment {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: ExpenseCategory | string;
  assignedMemberId: string; // Miembro responsable o 'shared'
  isPaid: boolean;
  paidDate?: string;
  recurrence: 'once' | 'monthly' | 'biweekly' | 'yearly';
  reminderDaysBefore: number; // días antes de avisar (default 3)
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category: 'emergencia' | 'vacaciones' | 'vivienda' | 'educacion' | 'compra' | 'deuda' | 'otro';
  lastMilestoneAcknowledged?: number; // 25, 50, 75, 90, 100
  color: string;
}

export interface MonthlyBudget {
  category: ExpenseCategory | string;
  budgetedAmount: number;
}

export interface HouseholdNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'alert' | 'info' | 'milestone';
  timestamp: string; // ISO
  read: boolean;
  actionUrl?: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number; // Porcentaje de ahorro respecto a ingresos
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
  urgentPaymentsCount: number; // Vencidos o vencen en <= 3 días
}

/**
 * Formato de moneda determinista e idéntico en servidor (SSR) y cliente.
 * Para Guaraníes Paraguayos (₲), se utiliza separación de miles con punto (.)
 * sin decimales (el guaraní no maneja centavos).
 */
export function formatAmount(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  const isNegative = value < 0;
  const absValue = Math.round(Math.abs(value));
  const formatted = absValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Determina el estado de urgencia de un pago según su fecha de vencimiento y estado.
 */
export function getPaymentUrgency(dueDateStr: string, isPaid: boolean, referenceDateStr?: string): PaymentUrgency {
  if (isPaid) return 'paid';

  // Usar referencia determinista para garantizar hidratación idéntica
  const refDate = referenceDateStr
    ? new Date(referenceDateStr + 'T00:00:00')
    : new Date('2026-10-24T00:00:00');
  refDate.setHours(0, 0, 0, 0);

  const dueDate = new Date(dueDateStr + 'T00:00:00');
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - refDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due_today';
  if (diffDays <= 3) return 'due_soon';
  return 'upcoming';
}

/**
 * Calcula el resumen financiero para un mes y año específicos.
 * Si se especifica un memberId distinto de 'all', calcula el resumen individual del perfil.
 * Si es 'all', calcula la suma total consolidada de todo el hogar.
 */
export function calculateMonthlySummary(
  transactions: Transaction[],
  payments: PendingPayment[],
  yearMonth: string,
  referenceDateStr: string = '2026-10-24',
  memberId: string | 'all' = 'all'
): MonthlySummary {
  const monthTransactions = transactions.filter((t) => {
    if (!t.date.startsWith(yearMonth)) return false;
    if (memberId !== 'all') {
      return t.memberId === memberId;
    }
    return true;
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of monthTransactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
    }
  }

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

  const monthPayments = payments.filter((p) => {
    if (!p.dueDate.startsWith(yearMonth)) return false;
    if (memberId !== 'all') {
      return p.assignedMemberId === memberId || p.assignedMemberId === 'shared';
    }
    return true;
  });

  let pendingPaymentsCount = 0;
  let pendingPaymentsAmount = 0;
  let urgentPaymentsCount = 0;

  for (const p of monthPayments) {
    if (!p.isPaid) {
      pendingPaymentsCount++;
      pendingPaymentsAmount += p.amount;
      const urgency = getPaymentUrgency(p.dueDate, p.isPaid, referenceDateStr);
      if (urgency === 'overdue' || urgency === 'due_today' || urgency === 'due_soon') {
        urgentPaymentsCount++;
      }
    }
  }

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    savingsRate,
    pendingPaymentsCount,
    pendingPaymentsAmount,
    urgentPaymentsCount,
  };
}

/**
 * Evalúa si una meta ha cruzado un nuevo hito porcentual motivador.
 * Hitos monitoreados: 25%, 50%, 75%, 90%, 100%.
 */
export function checkGoalMilestones(
  previousAmount: number,
  newAmount: number,
  targetAmount: number,
  lastAcknowledged: number = 0
): number | null {
  if (targetAmount <= 0) return null;

  const prevPct = Math.floor((previousAmount / targetAmount) * 100);
  const newPct = Math.floor((newAmount / targetAmount) * 100);

  const milestones = [25, 50, 75, 90, 100];

  for (let i = milestones.length - 1; i >= 0; i--) {
    const milestone = milestones[i];
    if (newPct >= milestone && prevPct < milestone && milestone > lastAcknowledged) {
      return milestone;
    }
  }

  return null;
}

/**
 * Genera mensajes motivacionales y positivos altamente personalizados para la Familia Galindo Salomon (GASA).
 */
export function getMotivationalMessage(
  eventType: 'payment_settled' | 'goal_milestone' | 'positive_balance' | 'budget_on_track' | 'savings_deposit',
  payload?: {
    title?: string;
    amount?: number;
    milestone?: number;
    memberName?: string;
  }
): { title: string; message: string; emoji: string } {
  switch (eventType) {
    case 'payment_settled': {
      const item = payload?.title ? `"${payload.title}"` : 'este pendiente';
      const payer = payload?.memberName ? ` gracias al aporte de ${payload.memberName}` : '';
      return {
        title: '¡Compromiso Resuelto Familia Galindo Salomon! 🇵🇾',
        message: `¡Gran victoria para el hogar GASA! Se liquidó el pago de ${item}${payer}. ¡Una cuenta menos y máxima tranquilidad para nuestra familia! 🌟`,
        emoji: '🎉',
      };
    }

    case 'goal_milestone': {
      const milestone = payload?.milestone || 50;
      const goalTitle = payload?.title ? `"${payload.title}"` : 'nuestro objetivo familiar';
      if (milestone >= 100) {
        return {
          title: '¡META ALCANZADA AL 100% FAMILIA GALINDO SALOMON! 🏆',
          message: `¡Felicidades a todos! En GASA objetivos completamos con éxito ${goalTitle}. La unión, esfuerzo y disciplina de nuestra familia lo hicieron realidad. ¡A celebrar! 🎊`,
          emoji: '🎊',
        };
      }
      return {
        title: `¡GASA superó el ${milestone}% de la Meta! 🚀`,
        message: `¡Gran avance para la Familia Galindo Salomon! Ya alcanzamos el ${milestone}% en ${goalTitle}. Cada guaraní ahorrado suma para el futuro de nuestro hogar. ¡Sigamos con todo!`,
        emoji: '⭐',
      };
    }

    case 'savings_deposit': {
      const amt = payload?.amount ? `Gs. ${formatAmount(payload.amount)}` : 'un aporte';
      const goal = payload?.title ? ` a "${payload.title}"` : '';
      return {
        title: '¡Aporte al Futuro de la Familia Galindo Salomon!',
        message: `Sumamos ${amt}${goal}. El equipo GASA sigue firme construyendo el patrimonio y bienestar familiar. ¡Excelente decisión!`,
        emoji: '💎',
      };
    }

    case 'positive_balance': {
      return {
        title: '¡Superávit en el Hogar Galindo Salomon!',
        message: '¡Excelente administración este mes para GASA! Los ingresos superan los gastos. Cuidar el presupuesto familiar nos da paz mental.',
        emoji: '📈',
      };
    }

    case 'budget_on_track':
    default: {
      return {
        title: '¡Presupuesto GASA en Orden!',
        message: 'Revisar y ajustar nuestros gastos a tiempo hace fuerte al hogar Galindo Salomon. ¡Buen trabajo hoy!',
        emoji: '✨',
      };
    }
  }
}

/**
 * Calcula desglose de gastos e ingresos por miembro del hogar.
 */
export function calculateMemberBreakdown(
  transactions: Transaction[],
  members: HouseholdMember[],
  yearMonth: string
): Array<{
  member: HouseholdMember | { id: 'shared'; name: string; avatarColor: string; avatarIcon: string };
  totalIncome: number;
  totalExpenses: number;
  contributionPercent: number;
}> {
  const monthTransactions = transactions.filter((t) => t.date.startsWith(yearMonth));
  const totalMonthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const sharedPseudoMember = {
    id: 'shared' as const,
    name: 'Gasto Común Familia Galindo Salomon',
    avatarColor: 'bg-indigo-600',
    avatarIcon: 'Home',
  };

  const allEntities = [...members, sharedPseudoMember];

  return allEntities.map((entity) => {
    const memberTx = monthTransactions.filter((t) => t.memberId === entity.id);
    const income = memberTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = memberTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const contributionPercent =
      totalMonthIncome > 0 ? Math.round((income / totalMonthIncome) * 100) : 0;

    return {
      member: entity,
      totalIncome: income,
      totalExpenses: expenses,
      contributionPercent,
    };
  });
}

/**
 * Calcula el estado de cada categoría presupuestada frente al gasto real.
 */
export function calculateBudgetComparison(
  budgets: MonthlyBudget[],
  transactions: Transaction[],
  yearMonth: string
): Array<{
  category: string;
  budgeted: number;
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
}> {
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(yearMonth)
  );

  return budgets.map((b) => {
    const spent = monthExpenses
      .filter((t) => t.category.toLowerCase() === b.category.toLowerCase())
      .reduce((acc, curr) => acc + curr.amount, 0);

    const percentage = b.budgetedAmount > 0 ? Math.round((spent / b.budgetedAmount) * 100) : 0;
    const remaining = b.budgetedAmount - spent;

    return {
      category: b.category,
      budgeted: b.budgetedAmount,
      spent,
      percentage,
      remaining,
      isOverBudget: spent > b.budgetedAmount,
    };
  });
}
