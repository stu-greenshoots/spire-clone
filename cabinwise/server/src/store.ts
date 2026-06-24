// Tiny JSON-file persistence for Phase 1 dev. Zero dependencies, runs anywhere.
// The relational target model lives in prisma/schema.prisma — we move to
// Prisma + Postgres when we host this on a normal network. Shapes mirror that
// schema, except item participants are embedded as `participantIds` for brevity.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import type { Category } from "./diet.js";

export type { Category };

export interface Member {
  id: string;
  tripId: string;
  name: string;
  vegetarian: boolean;
  vegan: boolean;
  drinksAlcohol: boolean;
}

export interface LineItem {
  id: string;
  name: string;
  amountPence: number;
  quantity: number;
  category: Category;
  participantIds: string[];
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  paidById: string;
  date: string; // ISO
  source: string; // "manual" | "receipt"
  items: LineItem[];
}

export interface Trip {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string; // ISO
}

interface DB {
  trips: Trip[];
  members: Member[];
  expenses: Expense[];
}

const DEFAULT_PATH = process.env.CABINWISE_DB ?? "./data.json";

function emptyDb(): DB {
  return { trips: [], members: [], expenses: [] };
}

export class Store {
  private db: DB;
  constructor(private path: string = DEFAULT_PATH) {
    this.db = existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as DB) : emptyDb();
  }

  private persist() {
    mkdirSync(dirname(this.path) === "" ? "." : dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(this.db, null, 2));
  }

  // --- Trips ---
  createTrip(input: { name: string; startDate?: string; endDate?: string }): Trip {
    const trip: Trip = {
      id: randomUUID(),
      name: input.name,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      createdAt: new Date().toISOString(),
    };
    this.db.trips.push(trip);
    this.persist();
    return trip;
  }

  listTrips(): Trip[] {
    return [...this.db.trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getTrip(id: string): Trip | undefined {
    return this.db.trips.find((t) => t.id === id);
  }

  membersOf(tripId: string): Member[] {
    return this.db.members.filter((m) => m.tripId === tripId);
  }

  expensesOf(tripId: string): Expense[] {
    return this.db.expenses
      .filter((e) => e.tripId === tripId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  // --- Members ---
  addMember(input: {
    tripId: string;
    name: string;
    vegetarian?: boolean;
    vegan?: boolean;
    drinksAlcohol?: boolean;
  }): Member {
    const member: Member = {
      id: randomUUID(),
      tripId: input.tripId,
      name: input.name,
      vegetarian: input.vegetarian ?? false,
      vegan: input.vegan ?? false,
      drinksAlcohol: input.drinksAlcohol ?? true,
    };
    this.db.members.push(member);
    this.persist();
    return member;
  }

  // --- Expenses ---
  addExpense(input: Omit<Expense, "id">): Expense {
    const expense: Expense = { id: randomUUID(), ...input };
    expense.items = expense.items.map((it) => ({ ...it, id: it.id || randomUUID() }));
    this.db.expenses.push(expense);
    this.persist();
    return expense;
  }

  deleteExpense(id: string): boolean {
    const before = this.db.expenses.length;
    this.db.expenses = this.db.expenses.filter((e) => e.id !== id);
    const removed = this.db.expenses.length < before;
    if (removed) this.persist();
    return removed;
  }

  reset() {
    this.db = emptyDb();
    this.persist();
  }
}
