import type { FeeLedger, FeeLedgerStatus, Student, StudentDiscount } from '@/types';
import { addMonths, getMonthStart, toISODate } from '@/lib/utils';

export interface LedgerEntry {
  month_year: Date;
  fee_amount: number;
  discount_amount: number;
  late_fee_amount: number;
  paid_amount: number;
  balance: number;
  status: FeeLedgerStatus;
  due_date: Date;
}

export function calculateDiscount(
  monthlyFee: number,
  discounts: StudentDiscount[],
  monthDate: Date
): number {
  const applicable = discounts.filter((d) => {
    if (!d.is_active) return false;
    if (d.start_date && new Date(d.start_date) > monthDate) return false;
    if (d.end_date && new Date(d.end_date) < monthDate) return false;
    return true;
  });

  return applicable.reduce((total, d) => {
    if (d.is_percentage) return total + (monthlyFee * d.amount) / 100;
    return total + d.amount;
  }, 0);
}

export function generateLedgerEntries(
  student: Student,
  discounts: StudentDiscount[],
  fromDate: Date,
  toDate: Date,
  dueDay = 5,
  lateFeeAmount = 0
): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  let current = getMonthStart(fromDate);
  const end = getMonthStart(toDate);

  while (current <= end) {
    const discount = calculateDiscount(student.monthly_fee, discounts, current);
    const netFee = student.monthly_fee - discount;
    const dueDate = new Date(current.getFullYear(), current.getMonth(), dueDay);

    entries.push({
      month_year: new Date(current),
      fee_amount: student.monthly_fee,
      discount_amount: discount,
      late_fee_amount: 0,
      paid_amount: 0,
      balance: netFee,
      status: 'pending',
      due_date: dueDate,
    });

    current = addMonths(current, 1);
  }

  return entries;
}

export interface AllocationResult {
  allocations: { month_year: string; amount: number }[];
  advance_balance: number;
  covered_months: string[];
}

export function allocatePayment(
  amount: number,
  ledgerEntries: FeeLedger[],
  oneTimeCharges: { id: string; amount: number; paid_amount: number }[] = []
): AllocationResult {
  let remaining = amount;
  const allocations: { month_year: string; amount: number }[] = [];
  const covered_months: string[] = [];

  // Allocate to one-time charges first
  for (const charge of oneTimeCharges) {
    const due = charge.amount - charge.paid_amount;
    if (due <= 0 || remaining <= 0) continue;
    const alloc = Math.min(remaining, due);
    remaining -= alloc;
  }

  // Allocate to monthly ledger (FIFO)
  const sorted = [...ledgerEntries]
    .filter((e) => e.status !== 'paid')
    .sort((a, b) => new Date(a.month_year).getTime() - new Date(b.month_year).getTime());

  for (const entry of sorted) {
    if (remaining <= 0) break;
    const netDue = entry.fee_amount - entry.discount_amount + entry.late_fee_amount - entry.paid_amount;
    if (netDue <= 0) continue;

    const alloc = Math.min(remaining, netDue);
    allocations.push({ month_year: entry.month_year, amount: alloc });
    if (alloc >= netDue) covered_months.push(entry.month_year);
    remaining -= alloc;
  }

  return {
    allocations,
    advance_balance: remaining,
    covered_months,
  };
}

export function getLedgerStatus(
  feeAmount: number,
  discountAmount: number,
  lateFeeAmount: number,
  paidAmount: number
): FeeLedgerStatus {
  const netDue = feeAmount - discountAmount + lateFeeAmount;
  if (paidAmount >= netDue) return 'paid';
  if (paidAmount > 0) return 'partial';
  return 'pending';
}

export function getStudentFeeSummary(
  ledger: FeeLedger[],
  advanceBalance = 0
) {
  const totalDue = ledger.reduce((sum, e) => sum + e.balance, 0);
  const totalPaid = ledger.reduce((sum, e) => sum + e.paid_amount, 0);
  const pendingMonths = ledger.filter((e) => e.status === 'pending' || e.status === 'partial');
  const paidMonths = ledger.filter((e) => e.status === 'paid');

  const lastPaidMonth = paidMonths.length > 0
    ? paidMonths.sort((a, b) => new Date(b.month_year).getTime() - new Date(a.month_year).getTime())[0]
    : null;

  return {
    totalDue,
    totalPaid,
    advanceBalance,
    pendingCount: pendingMonths.length,
    paidCount: paidMonths.length,
    coveredUntil: lastPaidMonth?.month_year ?? null,
    isInAdvance: advanceBalance > 0,
    hasDues: totalDue > 0,
  };
}

export function ensureLedgerRange(
  joiningDate: Date,
  monthsAhead = 3
): { from: Date; to: Date } {
  return {
    from: getMonthStart(joiningDate),
    to: addMonths(getMonthStart(new Date()), monthsAhead),
  };
}

export function formatCoveredMonths(months: string[]): string {
  return months
    .map((m) => new Date(m).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }))
    .join(', ');
}

export function generateReceiptNumber(existingCount: number, year?: number): string {
  const y = year ?? new Date().getFullYear();
  return `RCPT-${y}-${String(existingCount + 1).padStart(5, '0')}`;
}

export { toISODate, getMonthStart, addMonths };
