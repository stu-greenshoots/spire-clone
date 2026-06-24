import type { FastifyInstance } from "fastify";
import { Store, type LineItem } from "../store.js";
import { computeBalances, settleUp, type ExpenseInput } from "../splitting.js";
import { defaultParticipants, type Category } from "../diet.js";

const store = new Store();

export async function tripRoutes(app: FastifyInstance) {
  // Create a trip
  app.post("/trips", async (req) => {
    const body = req.body as { name: string; startDate?: string; endDate?: string };
    return store.createTrip(body);
  });

  // List trips
  app.get("/trips", async () => store.listTrips());

  // Full trip detail (members + expenses with embedded item participants)
  app.get("/trips/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const trip = store.getTrip(id);
    if (!trip) return reply.code(404).send({ error: "Trip not found" });
    return {
      ...trip,
      members: store.membersOf(id),
      expenses: store.expensesOf(id),
    };
  });

  // Add a member
  app.post("/trips/:id/members", async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!store.getTrip(id)) return reply.code(404).send({ error: "Trip not found" });
    const body = req.body as {
      name: string;
      vegetarian?: boolean;
      vegan?: boolean;
      drinksAlcohol?: boolean;
    };
    return store.addMember({ tripId: id, ...body });
  });

  // Add an expense with line items. For each item you may pass explicit
  // participantIds; if omitted they default from the item's category + diet rules.
  app.post("/trips/:id/expenses", async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!store.getTrip(id)) return reply.code(404).send({ error: "Trip not found" });
    const body = req.body as {
      description: string;
      paidById: string;
      date?: string;
      source?: string;
      items: {
        name: string;
        amountPence: number;
        quantity?: number;
        category?: Category;
        participantIds?: string[];
      }[];
    };

    const members = store.membersOf(id);
    const memberIds = new Set(members.map((m) => m.id));
    if (!memberIds.has(body.paidById)) {
      return reply.code(400).send({ error: "paidById is not a member of this trip" });
    }

    const items: LineItem[] = body.items.map((item) => {
      const category = (item.category ?? "shared") as Category;
      const participantIds =
        item.participantIds && item.participantIds.length > 0
          ? item.participantIds.filter((pid) => memberIds.has(pid))
          : defaultParticipants(members, category);
      return {
        id: "",
        name: item.name,
        amountPence: item.amountPence,
        quantity: item.quantity ?? 1,
        category,
        participantIds,
      };
    });

    return store.addExpense({
      tripId: id,
      description: body.description,
      paidById: body.paidById,
      date: body.date ?? new Date().toISOString(),
      source: body.source ?? "manual",
      items,
    });
  });

  // Delete an expense
  app.delete("/expenses/:expenseId", async (req, reply) => {
    const { expenseId } = req.params as { expenseId: string };
    if (!store.deleteExpense(expenseId)) {
      return reply.code(404).send({ error: "Expense not found" });
    }
    return { ok: true };
  });

  // Balances + settle-up suggestions
  app.get("/trips/:id/balances", async (req, reply) => {
    const { id } = req.params as { id: string };
    const trip = store.getTrip(id);
    if (!trip) return reply.code(404).send({ error: "Trip not found" });

    const members = store.membersOf(id);
    const expenses: ExpenseInput[] = store.expensesOf(id).map((e) => ({
      paidById: e.paidById,
      items: e.items.map((it) => ({
        amountPence: it.amountPence,
        participantIds: it.participantIds,
      })),
    }));

    const balances = computeBalances(
      members.map((m) => m.id),
      expenses
    );
    const transfers = settleUp(balances);
    const nameById = Object.fromEntries(members.map((m) => [m.id, m.name]));

    return {
      balances: balances.map((b) => ({ ...b, name: nameById[b.memberId] })),
      transfers: transfers.map((t) => ({
        ...t,
        fromName: nameById[t.fromMemberId],
        toName: nameById[t.toMemberId],
      })),
    };
  });
}
