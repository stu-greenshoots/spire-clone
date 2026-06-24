# Cabinwise

A shared-expense app for group trips — like Splitwise, but built around the way
a group actually shops and cooks together on holiday. Free, no account nagging,
and aware that not everyone eats meat, drinks alcohol, or joins every meal.

## Why not just use Splitwise?

Splitwise splits an **expense** N ways. On a group trip, a single £140 Tesco shop
is really 40 line items, and each item has a *different* set of people on the hook:

- The steaks → the 4 meat-eaters
- The oat milk → the 2 vegans
- The case of beer → the 5 drinkers
- The teabags & olive oil → everyone

Cabinwise models money at the **line-item level**. "Your share" is the sum of your
slice of every item you're actually in on. Diet/drink profiles auto-decide who's
in on what, and you can override per item.

## Roadmap

- **Phase 1 — Core ledger** *(in progress)*: trips, members, item-level expenses,
  automatic per-item participation from dietary profiles, and settle-up balances.
- **Phase 2 — Receipt scanning**: photograph a receipt → parse line items & prices →
  auto-tag categories → tap who's in. (Uses the Claude vision API.)
- **Phase 3 — Meal planning**: plan meals, assign cooks & eaters, generate a
  consolidated bulk shopping list, then reconcile against the real receipt so people
  who skipped a meal drop off its cost automatically.

> Note: auto-placing a Tesco/Sainsbury's order isn't possible — neither exposes a
> public ordering API. Cabinwise produces a clean consolidated shopping list to order
> from, and shines on the receipt-reconciliation side after you've shopped.

## Structure

```
cabinwise/
  server/        Fastify + TypeScript API
    prisma/      schema.prisma — the canonical relational data model (target for hosting)
    src/
      splitting.ts       Pure balance/settle-up engine (no DB) — the heart of the app
      splitting.test.ts  Tests for the engine
      diet.ts            Auto-participation rules from dietary profiles
      store.ts           Tiny JSON-file persistence for dev
      routes/            HTTP routes
      index.ts           Server entry
  web/           (Phase 1b) React + Vite PWA front-end — not built yet
```

### Persistence

Dev uses a zero-dependency JSON file store (`store.ts`) so it runs anywhere with
no native-binary downloads. `prisma/schema.prisma` documents the target relational
model — we switch the store implementation to Prisma + Postgres when we host this on
a normal network. The HTTP API and the splitting engine don't change when we do.

## Running the server

```bash
cd server
npm install
npm run seed           # optional: load a sample trip into ./data.json
npm run dev            # start the API on http://localhost:3001
npm test               # run the splitting-engine tests
```

### Try it

```bash
curl localhost:3001/trips                       # list trips
curl localhost:3001/trips/<id>/balances         # per-person net + settle-up
```

## Money

All amounts are stored as **integer pence** to avoid floating-point rounding errors.
The splitting engine distributes any indivisible remainder pennies deterministically.
