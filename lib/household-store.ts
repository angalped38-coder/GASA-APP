import {
  HouseholdMember,
  Transaction,
  PendingPayment,
  SavingsGoal,
  MonthlyBudget,
  HouseholdNotification,
  SupermarketItem,
} from './finance-logic';

export interface HouseholdState {
  householdName: string;
  currencySymbol: string;
  activeMemberId: string | 'all';
  members: HouseholdMember[];
  transactions: Transaction[];
  payments: PendingPayment[];
  goals: SavingsGoal[];
  budgets: MonthlyBudget[];
  notifications: HouseholdNotification[];
  supermarketItems: SupermarketItem[];
  selectedMonth: string;
}

export const INITIAL_SUPERMARKET_ITEMS: SupermarketItem[] = [
  {
    id: 'sm-1',
    name: 'Leche Entera en Sachet (1L)',
    category: 'lacteos_huevos',
    quantity: 6,
    unit: 'litro',
    estimatedPrice: 6200,
    purchased: false,
    requestedByMemberId: 'm-salomon',
    notes: 'Para el desayuno familiar de toda la semana',
    addedDate: '2026-10-23',
    isReferencePrice: true,
  },
  {
    id: 'sm-2',
    name: 'Arroz Blanco Tipo 1 (1 kg)',
    category: 'almacen',
    quantity: 2,
    unit: 'kg',
    estimatedPrice: 7200,
    purchased: false,
    requestedByMemberId: 'm-galindo',
    notes: 'Canasta básica para el almuerzo',
    addedDate: '2026-10-22',
    isReferencePrice: true,
  },
  {
    id: 'sm-3',
    name: 'Huevos Blancos Tipo A (Docena)',
    category: 'lacteos_huevos',
    quantity: 2,
    unit: 'docena',
    estimatedPrice: 16000,
    purchased: false,
    requestedByMemberId: 'm-galindo',
    notes: 'Maple de 24 huevos en total',
    addedDate: '2026-10-23',
    isReferencePrice: true,
  },
  {
    id: 'sm-4',
    name: 'Queso Paraguay Artesanal (1 kg)',
    category: 'lacteos_huevos',
    quantity: 1,
    unit: 'kg',
    estimatedPrice: 38000,
    purchased: false,
    requestedByMemberId: 'm-salomon',
    notes: 'Para hacer sopa paraguaya el fin de semana',
    addedDate: '2026-10-24',
    isReferencePrice: true,
  },
  {
    id: 'sm-5',
    name: 'Banana Nanica Fresca (Docena)',
    category: 'verduras_frutas',
    quantity: 1,
    unit: 'docena',
    estimatedPrice: 8500,
    purchased: true,
    requestedByMemberId: 'm-mateo',
    notes: 'Para la merienda después del colegio',
    addedDate: '2026-10-23',
    isReferencePrice: true,
  },
  {
    id: 'sm-6',
    name: 'Detergente Líquido Lavavajillas (500 ml)',
    category: 'limpieza',
    quantity: 2,
    unit: 'unid',
    estimatedPrice: 6500,
    purchased: false,
    requestedByMemberId: 'm-salomon',
    notes: 'Cocina limpia y desengrasada',
    addedDate: '2026-10-24',
    isReferencePrice: true,
  },
  {
    id: 'sm-7',
    name: 'Galletitas dulces para la merienda',
    category: 'almacen',
    quantity: 2,
    unit: 'paquete',
    estimatedPrice: 9500,
    purchased: false,
    requestedByMemberId: 'm-valentina',
    notes: 'Pedido especial de Valentina para compartir',
    addedDate: '2026-10-24',
    isReferencePrice: false,
  },
];

export const INITIAL_HOUSEHOLD_DATA: HouseholdState = {
  householdName: 'GASA objetivos (Familia Galindo Salomon)',
  currencySymbol: 'Gs. ',
  activeMemberId: 'all',
  selectedMonth: '2026-10',
  supermarketItems: INITIAL_SUPERMARKET_ITEMS,
  members: [
    {
      id: 'm-galindo',
      name: 'Carlos Galindo (Papá)',
      role: 'Administrador',
      avatarColor: 'from-emerald-500 to-teal-600',
      avatarIcon: 'UserCheck',
      monthlyContributionGoal: 5500000,
      isDefault: true,
    },
    {
      id: 'm-salomon',
      name: 'Patricia Salomon (Mamá)',
      role: 'Madre',
      avatarColor: 'from-blue-500 to-indigo-600',
      avatarIcon: 'User',
      monthlyContributionGoal: 4800000,
    },
    {
      id: 'm-mateo',
      name: 'Mateo Galindo Salomon',
      role: 'Hijo/a',
      avatarColor: 'from-purple-500 to-pink-600',
      avatarIcon: 'GraduationCap',
      monthlyContributionGoal: 800000,
    },
    {
      id: 'm-valentina',
      name: 'Valentina Galindo Salomon',
      role: 'Hijo/a',
      avatarColor: 'from-amber-500 to-orange-600',
      avatarIcon: 'Smile',
      monthlyContributionGoal: 0,
    },
  ],
  transactions: [
    {
      id: 'tx-1',
      concept: 'Salario Mensual Carlos Galindo',
      amount: 5500000,
      type: 'income',
      category: 'salario',
      date: '2026-10-02',
      memberId: 'm-galindo',
      paymentMethod: 'transferencia',
      notes: 'Depósito nómina mensual',
    },
    {
      id: 'tx-2',
      concept: 'Ingreso Consultoría Patricia Salomon',
      amount: 4800000,
      type: 'income',
      category: 'salario',
      date: '2026-10-03',
      memberId: 'm-salomon',
      paymentMethod: 'transferencia',
    },
    {
      id: 'tx-3',
      concept: 'Trabajos de Diseño Mateo',
      amount: 850000,
      type: 'income',
      category: 'honorarios',
      date: '2026-10-12',
      memberId: 'm-mateo',
      paymentMethod: 'transferencia',
    },
    {
      id: 'tx-4',
      concept: 'Supermercado Mensual Familiar Stock/Superseis',
      amount: 1450000,
      type: 'expense',
      category: 'alimentacion',
      date: '2026-10-05',
      memberId: 'shared',
      paymentMethod: 'debito',
      notes: 'Compras de despensa para el hogar',
    },
    {
      id: 'tx-5',
      concept: 'Seguro Médico Familiar Privado',
      amount: 680000,
      type: 'expense',
      category: 'salud',
      date: '2026-10-08',
      memberId: 'shared',
      paymentMethod: 'transferencia',
    },
    {
      id: 'tx-6',
      concept: 'Combustible y Movilidad Hogar GASA',
      amount: 520000,
      type: 'expense',
      category: 'transporte',
      date: '2026-10-10',
      memberId: 'm-galindo',
      paymentMethod: 'debito',
    },
    {
      id: 'tx-7',
      concept: 'Materiales y Libros Universitarios',
      amount: 320000,
      type: 'expense',
      category: 'educacion',
      date: '2026-10-14',
      memberId: 'm-mateo',
      paymentMethod: 'debito',
    },
    {
      id: 'tx-8',
      concept: 'Almuerzo Familiar de Fin de Semana',
      amount: 280000,
      type: 'expense',
      category: 'ocio',
      date: '2026-10-18',
      memberId: 'shared',
      paymentMethod: 'credito',
    },
  ],
  payments: [
    {
      id: 'pay-1',
      title: 'Factura Electricidad ANDE (Hogar)',
      amount: 310000,
      dueDate: '2026-10-25',
      category: 'servicios',
      assignedMemberId: 'm-salomon',
      isPaid: false,
      recurrence: 'monthly',
      reminderDaysBefore: 3,
      notes: 'Vence mañana. Pago vía app bancaria o boca de cobranza',
    },
    {
      id: 'pay-2',
      title: 'Cuota Alquiler / Vivienda Familiar GASA',
      amount: 2400000,
      dueDate: '2026-10-28',
      category: 'vivienda',
      assignedMemberId: 'm-galindo',
      isPaid: false,
      recurrence: 'monthly',
      reminderDaysBefore: 5,
      notes: 'Transferencia bancaria programada',
    },
    {
      id: 'pay-3',
      title: 'Internet Fibra Óptica WiFi Hogar',
      amount: 185000,
      dueDate: '2026-10-30',
      category: 'servicios',
      assignedMemberId: 'm-salomon',
      isPaid: false,
      recurrence: 'monthly',
      reminderDaysBefore: 3,
    },
    {
      id: 'pay-4',
      title: 'Cuota Electrodoméstico Familiar (4/12)',
      amount: 450000,
      dueDate: '2026-11-05',
      category: 'cuotas',
      assignedMemberId: 'm-galindo',
      isPaid: false,
      recurrence: 'monthly',
      reminderDaysBefore: 4,
    },
    {
      id: 'pay-5',
      title: 'Agua Corriente ESSAP',
      amount: 95000,
      dueDate: '2026-10-15',
      category: 'servicios',
      assignedMemberId: 'm-salomon',
      isPaid: true,
      paidDate: '2026-10-14',
      recurrence: 'monthly',
      reminderDaysBefore: 3,
      notes: 'Pagado puntualmente',
    },
  ],
  goals: [
    {
      id: 'goal-1',
      title: 'Fondo de Emergencia Familia Galindo Salomon',
      targetAmount: 20000000,
      currentAmount: 15200000,
      targetDate: '2027-03-31',
      category: 'emergencia',
      lastMilestoneAcknowledged: 75,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'goal-2',
      title: 'Vacaciones Familiares GASA en Brasil/Mar',
      targetAmount: 10000000,
      currentAmount: 7200000,
      targetDate: '2027-01-15',
      category: 'vacaciones',
      lastMilestoneAcknowledged: 70,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'goal-3',
      title: 'Mejora y Pintura del Hogar Galindo Salomon',
      targetAmount: 5000000,
      currentAmount: 4600000,
      targetDate: '2026-12-15',
      category: 'vivienda',
      lastMilestoneAcknowledged: 90,
      color: 'from-amber-500 to-rose-600',
    },
  ],
  budgets: [
    { category: 'alimentacion', budgetedAmount: 2200000 },
    { category: 'vivienda', budgetedAmount: 2600000 },
    { category: 'servicios', budgetedAmount: 700000 },
    { category: 'transporte', budgetedAmount: 800000 },
    { category: 'salud', budgetedAmount: 850000 },
    { category: 'educacion', budgetedAmount: 600000 },
    { category: 'cuotas', budgetedAmount: 600000 },
    { category: 'ocio', budgetedAmount: 600000 },
  ],
  notifications: [
    {
      id: 'notif-1',
      title: '¡Felicidades Familia Galindo Salomon!',
      message: '¡El hogar GASA alcanzó el 75% en el Fondo de Emergencia! Sigamos firmes con nuestros objetivos.',
      type: 'milestone',
      timestamp: '2026-10-20T10:00:00Z',
      read: true,
    },
    {
      id: 'notif-2',
      title: 'Recordatorio de Vencimiento Próximo',
      message: 'Factura Electricidad ANDE (₲ 310.000) vence mañana 25 de Octubre.',
      type: 'alert',
      timestamp: '2026-10-24T08:00:00Z',
      read: false,
    },
  ],
};

const STORAGE_KEY = 'gasa_objetivos_familia_galindo_salomon_v2';

export function loadHouseholdState(): HouseholdState {
  if (typeof window === 'undefined') return INITIAL_HOUSEHOLD_DATA;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      saveHouseholdState(INITIAL_HOUSEHOLD_DATA);
      return INITIAL_HOUSEHOLD_DATA;
    }
    const parsed = JSON.parse(saved);
    return {
      ...INITIAL_HOUSEHOLD_DATA,
      ...parsed,
      currencySymbol: 'Gs. ',
      householdName: 'GASA objetivos (Familia Galindo Salomon)',
      supermarketItems: Array.isArray(parsed.supermarketItems) && parsed.supermarketItems.length > 0
        ? parsed.supermarketItems
        : INITIAL_SUPERMARKET_ITEMS,
    };
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
    return INITIAL_HOUSEHOLD_DATA;
  }
}

export function saveHouseholdState(state: HouseholdState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

export async function requestBrowserNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  } catch {
    return false;
  }
}

export function sendBrowserNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    }
  } catch (e) {
    console.debug('Notification could not be dispatched', e);
  }
}
