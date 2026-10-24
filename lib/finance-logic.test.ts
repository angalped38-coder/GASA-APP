import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPaymentUrgency,
  calculateMonthlySummary,
  checkGoalMilestones,
  getMotivationalMessage,
  calculateBudgetComparison,
  formatAmount,
  Transaction,
  PendingPayment,
  MonthlyBudget,
} from './finance-logic';

test('formatAmount formats Guaraníes Paraguayos with period thousands separator and no cents', () => {
  assert.equal(formatAmount(5500000), '5.500.000');
  assert.equal(formatAmount(310000), '310.000');
  assert.equal(formatAmount(0), '0');
  assert.equal(formatAmount(-2400000), '-2.400.000');
});

test('getPaymentUrgency correctly classifies overdue, today, soon, upcoming, and paid', () => {
  const refDate = '2026-10-24';

  assert.equal(getPaymentUrgency('2026-10-20', false, refDate), 'overdue');
  assert.equal(getPaymentUrgency('2026-10-24', false, refDate), 'due_today');
  assert.equal(getPaymentUrgency('2026-10-26', false, refDate), 'due_soon');
  assert.equal(getPaymentUrgency('2026-11-05', false, refDate), 'upcoming');
  assert.equal(getPaymentUrgency('2026-10-20', true, refDate), 'paid');
});

test('calculateMonthlySummary aggregates incomes, expenses, net balance, and urgent payments', () => {
  const transactions: Transaction[] = [
    {
      id: 'tx-1',
      concept: 'Salario Carlos Galindo',
      amount: 5500000,
      type: 'income',
      category: 'salario',
      date: '2026-10-01',
      memberId: 'm1',
      paymentMethod: 'transferencia',
    },
    {
      id: 'tx-2',
      concept: 'Supermercado Stock',
      amount: 1450000,
      type: 'expense',
      category: 'alimentacion',
      date: '2026-10-05',
      memberId: 'shared',
      paymentMethod: 'debito',
    },
    {
      id: 'tx-3',
      concept: 'Internet Tigo',
      amount: 185000,
      type: 'expense',
      category: 'servicios',
      date: '2026-10-10',
      memberId: 'shared',
      paymentMethod: 'transferencia',
    },
  ];

  const payments: PendingPayment[] = [
    {
      id: 'p1',
      title: 'Factura ANDE',
      amount: 310000,
      dueDate: '2026-10-25',
      category: 'servicios',
      assignedMemberId: 'm1',
      isPaid: false,
      recurrence: 'monthly',
      reminderDaysBefore: 3,
    },
    {
      id: 'p2',
      title: 'Agua ESSAP Vencida',
      amount: 95000,
      dueDate: '2026-10-18',
      category: 'servicios',
      assignedMemberId: 'shared',
      isPaid: false,
      recurrence: 'monthly',
      reminderDaysBefore: 3,
    },
  ];

  const summaryHogar = calculateMonthlySummary(transactions, payments, '2026-10', '2026-10-24', 'all');

  assert.equal(summaryHogar.totalIncome, 5500000);
  assert.equal(summaryHogar.totalExpenses, 1635000);
  assert.equal(summaryHogar.netBalance, 3865000);
  assert.equal(summaryHogar.pendingPaymentsCount, 2);

  // Individual profile summary for m1
  const summaryM1 = calculateMonthlySummary(transactions, payments, '2026-10', '2026-10-24', 'm1');
  assert.equal(summaryM1.totalIncome, 5500000);
  assert.equal(summaryM1.totalExpenses, 0); // No individual expenses for m1
  assert.equal(summaryM1.netBalance, 5500000);

  // Individual profile summary for shared or non-existent
  const summaryShared = calculateMonthlySummary(transactions, payments, '2026-10', '2026-10-24', 'shared');
  assert.equal(summaryShared.totalIncome, 0);
  assert.equal(summaryShared.totalExpenses, 1635000);
});

test('checkGoalMilestones triggers correctly when crossing 25, 50, 75, 90, 100 thresholds', () => {
  const target = 10000000;

  // Not crossing
  assert.equal(checkGoalMilestones(1000000, 2000000, target, 0), null);

  // Crossing 25%
  assert.equal(checkGoalMilestones(2000000, 2600000, target, 0), 25);

  // Already acknowledged 25%, not crossing 50%
  assert.equal(checkGoalMilestones(2600000, 4000000, target, 25), null);

  // Crossing 50%
  assert.equal(checkGoalMilestones(4000000, 5200000, target, 25), 50);

  // Crossing directly to 100%
  assert.equal(checkGoalMilestones(8000000, 10500000, target, 75), 100);
});

test('getMotivationalMessage returns encouraging copy mentioning Familia Galindo Salomon and GASA', () => {
  const paymentMsg = getMotivationalMessage('payment_settled', {
    title: 'Factura ANDE',
    memberName: 'Patricia Salomon',
  });
  assert.ok(paymentMsg.title.includes('Galindo Salomon') || paymentMsg.title.includes('GASA'));
  assert.ok(paymentMsg.message.includes('Factura ANDE'));
  assert.ok(paymentMsg.message.includes('Patricia Salomon'));

  const goalMsg = getMotivationalMessage('goal_milestone', {
    title: 'Vacaciones Familia Galindo Salomon',
    milestone: 50,
  });
  assert.ok(goalMsg.title.includes('50%'));
  assert.ok(goalMsg.message.includes('Galindo Salomon') || goalMsg.message.includes('GASA'));
});

test('calculateBudgetComparison checks budget usage and detects overspending', () => {
  const budgets: MonthlyBudget[] = [
    { category: 'alimentacion', budgetedAmount: 2000000 },
    { category: 'ocio', budgetedAmount: 500000 },
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx-1',
      concept: 'Supermercado Stock',
      amount: 1400000,
      type: 'expense',
      category: 'alimentacion',
      date: '2026-10-02',
      memberId: 'shared',
      paymentMethod: 'debito',
    },
    {
      id: 'tx-2',
      concept: 'Cena familiar',
      amount: 600000,
      type: 'expense',
      category: 'ocio',
      date: '2026-10-15',
      memberId: 'shared',
      paymentMethod: 'tarjeta',
    },
  ];

  const comparison = calculateBudgetComparison(budgets, transactions, '2026-10');

  const food = comparison.find((c) => c.category === 'alimentacion');
  assert.ok(food);
  assert.equal(food.spent, 1400000);
  assert.equal(food.remaining, 600000);
  assert.equal(food.isOverBudget, false);
  assert.equal(food.percentage, 70);

  const leisure = comparison.find((c) => c.category === 'ocio');
  assert.ok(leisure);
  assert.equal(leisure.spent, 600000);
  assert.equal(leisure.remaining, -100000);
  assert.equal(leisure.isOverBudget, true);
  assert.equal(leisure.percentage, 120);
});

test('isChildRole and isParentOrAdmin enforce household hierarchy', async () => {
  const { isChildRole, isParentOrAdmin, getRolePermissions } = await import('./finance-logic');

  assert.equal(isChildRole('Hijo/a'), true);
  assert.equal(isChildRole('Hijo'), true);
  assert.equal(isChildRole('Hija'), true);
  assert.equal(isChildRole('Padre'), false);
  assert.equal(isChildRole('Madre'), false);
  assert.equal(isChildRole('Administrador'), false);

  assert.equal(isParentOrAdmin('Administrador'), true);
  assert.equal(isParentOrAdmin('Padre'), true);
  assert.equal(isParentOrAdmin('Madre'), true);
  assert.equal(isParentOrAdmin('Hijo/a'), false);

  const childPerms = getRolePermissions('Hijo/a');
  assert.equal(childPerms.canViewFinances, false);
  assert.equal(childPerms.canModifyFinances, false);
  assert.equal(childPerms.canViewSupermarket, true);
  assert.equal(childPerms.canAddSupermarketItems, true);
  assert.equal(childPerms.canConvertSupermarketToExpense, false);

  const parentPerms = getRolePermissions('Padre');
  assert.equal(parentPerms.canViewFinances, true);
  assert.equal(parentPerms.canModifyFinances, true);
  assert.equal(parentPerms.canConvertSupermarketToExpense, true);
});

test('calculateSupermarketTotals sums pending vs purchased items correctly in Guaraníes', async () => {
  const { calculateSupermarketTotals, SupermarketItem } = await import('./finance-logic');

  const items = [
    {
      id: 'sm-1',
      name: 'Leche sachet 1L',
      category: 'lacteos_huevos',
      quantity: 6,
      unit: 'litro',
      estimatedPrice: 6200,
      purchased: false,
      requestedByMemberId: 'm1',
      addedDate: '2026-10-24',
    },
    {
      id: 'sm-2',
      name: 'Arroz blanco 1kg',
      category: 'almacen',
      quantity: 2,
      unit: 'kg',
      estimatedPrice: 7200,
      purchased: true,
      requestedByMemberId: 'm2',
      addedDate: '2026-10-24',
    },
  ];

  const totals = calculateSupermarketTotals(items as any);
  assert.equal(totals.totalEstimatedPending, 6 * 6200); // 37.200 Gs.
  assert.equal(totals.totalEstimatedPurchased, 2 * 7200); // 14.400 Gs.
  assert.equal(totals.totalEstimatedAll, 37200 + 14400); // 51.600 Gs.
  assert.equal(totals.pendingCount, 1);
  assert.equal(totals.purchasedCount, 1);
  assert.equal(totals.totalItemsCount, 2);
});

test('comprador.digital catalog provides unbranded staples with realistic Guaraníes prices', async () => {
  const { COMPRADOR_DIGITAL_CATALOG, searchCompradorDigitalProducts } = await import('./comprador-digital');

  assert.ok(COMPRADOR_DIGITAL_CATALOG.length >= 15);

  const leche = searchCompradorDigitalProducts('leche');
  assert.ok(leche.length >= 1);
  assert.ok(leche[0].averagePriceGs >= 5000 && leche[0].averagePriceGs <= 10000);

  const arroz = searchCompradorDigitalProducts('arroz');
  assert.ok(arroz.length >= 1);
  assert.ok(arroz[0].averagePriceGs >= 6000 && arroz[0].averagePriceGs <= 12000);
});

