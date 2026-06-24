// The core balance engine. Pure functions, no database — so it's trivially
// testable and reusable on the front-end if we want optimistic UI later.
//
// All money is integer pence. When a line item doesn't divide evenly among its
// participants, the remainder pennies are handed out one each to the first few
// participants (ordered by id) so totals always reconcile to the exact penny.

export interface ItemInput {
  amountPence: number;
  participantIds: string[];
}

export interface ExpenseInput {
  paidById: string;
  items: ItemInput[];
}

export interface MemberBalance {
  memberId: string;
  /** Total this member paid out (fronted) across all expenses. */
  paidPence: number;
  /** Total this member is responsible for (their share of items). */
  owedPence: number;
  /** paid - owed. Positive = others owe them; negative = they owe. */
  netPence: number;
}

export interface Transfer {
  fromMemberId: string;
  toMemberId: string;
  amountPence: number;
}

/** Split one line item's cost across its participants, distributing remainder pennies. */
export function splitItem(amountPence: number, participantIds: string[]): Map<string, number> {
  const result = new Map<string, number>();
  const n = participantIds.length;
  if (n === 0) return result; // nobody assigned -> nobody charged (cost is unallocated)

  const base = Math.floor(amountPence / n);
  let remainder = amountPence - base * n;

  // Deterministic remainder distribution: sort participants by id.
  const ordered = [...participantIds].sort();
  for (const id of ordered) {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder--;
    result.set(id, (result.get(id) ?? 0) + base + extra);
  }
  return result;
}

/** Compute each member's paid / owed / net balance. */
export function computeBalances(memberIds: string[], expenses: ExpenseInput[]): MemberBalance[] {
  const paid = new Map<string, number>();
  const owed = new Map<string, number>();
  for (const id of memberIds) {
    paid.set(id, 0);
    owed.set(id, 0);
  }

  for (const expense of expenses) {
    let expenseTotal = 0;
    for (const item of expense.items) {
      expenseTotal += item.amountPence;
      const shares = splitItem(item.amountPence, item.participantIds);
      for (const [memberId, share] of shares) {
        owed.set(memberId, (owed.get(memberId) ?? 0) + share);
      }
    }
    paid.set(expense.paidById, (paid.get(expense.paidById) ?? 0) + expenseTotal);
  }

  return memberIds.map((memberId) => {
    const p = paid.get(memberId) ?? 0;
    const o = owed.get(memberId) ?? 0;
    return { memberId, paidPence: p, owedPence: o, netPence: p - o };
  });
}

/**
 * Greedily minimise the number of transfers needed to settle up.
 * Repeatedly match the biggest debtor with the biggest creditor.
 */
export function settleUp(balances: MemberBalance[]): Transfer[] {
  const debtors = balances
    .filter((b) => b.netPence < 0)
    .map((b) => ({ id: b.memberId, amount: -b.netPence }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .filter((b) => b.netPence > 0)
    .map((b) => ({ id: b.memberId, amount: b.netPence }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);
    if (amount > 0) {
      transfers.push({
        fromMemberId: debtor.id,
        toMemberId: creditor.id,
        amountPence: amount,
      });
    }
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }
  return transfers;
}
