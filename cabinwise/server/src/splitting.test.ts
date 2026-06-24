import { describe, it, expect } from "vitest";
import { splitItem, computeBalances, settleUp } from "./splitting.js";
import { consumes, defaultParticipants } from "./diet.js";

describe("splitItem", () => {
  it("splits evenly when divisible", () => {
    const shares = splitItem(900, ["a", "b", "c"]);
    expect([...shares.values()]).toEqual([300, 300, 300]);
  });

  it("distributes remainder pennies deterministically and conserves total", () => {
    const shares = splitItem(1000, ["a", "b", "c"]); // 1000 / 3 = 333.33
    const values = [...shares.values()];
    expect(values.reduce((s, v) => s + v, 0)).toBe(1000);
    // a and b get the two extra pennies (sorted order)
    expect(shares.get("a")).toBe(334);
    expect(shares.get("b")).toBe(333);
    expect(shares.get("c")).toBe(333);
  });

  it("charges nobody when no participants", () => {
    expect(splitItem(500, []).size).toBe(0);
  });
});

describe("computeBalances", () => {
  it("tracks item-level participation, not whole-expense splits", () => {
    // Alex pays for a shop: £6 shared (all 3) + £9 steak (Alex & Bo only, not Cal the vegan)
    const balances = computeBalances(
      ["alex", "bo", "cal"],
      [
        {
          paidById: "alex",
          items: [
            { amountPence: 600, participantIds: ["alex", "bo", "cal"] },
            { amountPence: 900, participantIds: ["alex", "bo"] },
          ],
        },
      ]
    );
    const byId = Object.fromEntries(balances.map((b) => [b.memberId, b]));
    // shared: 200 each. steak: 450 each (alex, bo).
    expect(byId.alex.owedPence).toBe(650);
    expect(byId.bo.owedPence).toBe(650);
    expect(byId.cal.owedPence).toBe(200); // vegan only owes the shared part
    expect(byId.alex.paidPence).toBe(1500);
    expect(byId.alex.netPence).toBe(850); // fronted 1500, owes 650
    expect(byId.cal.netPence).toBe(-200);
    // Conservation: nets sum to zero.
    expect(balances.reduce((s, b) => s + b.netPence, 0)).toBe(0);
  });
});

describe("settleUp", () => {
  it("produces transfers that clear all balances", () => {
    const balances = [
      { memberId: "alex", paidPence: 0, owedPence: 0, netPence: 850 },
      { memberId: "bo", paidPence: 0, owedPence: 0, netPence: -650 },
      { memberId: "cal", paidPence: 0, owedPence: 0, netPence: -200 },
    ];
    const transfers = settleUp(balances);
    // Everyone ends at zero after applying transfers.
    const net = Object.fromEntries(balances.map((b) => [b.memberId, b.netPence]));
    for (const t of transfers) {
      net[t.fromMemberId] += t.amountPence;
      net[t.toMemberId] -= t.amountPence;
    }
    expect(Object.values(net).every((v) => v === 0)).toBe(true);
  });
});

describe("diet rules", () => {
  it("excludes vegans from meat and dairy, teetotallers from alcohol", () => {
    const vegan = { vegetarian: true, vegan: true, drinksAlcohol: false };
    expect(consumes(vegan, "meat")).toBe(false);
    expect(consumes(vegan, "dairy")).toBe(false);
    expect(consumes(vegan, "alcohol")).toBe(false);
    expect(consumes(vegan, "vegan")).toBe(true);
    expect(consumes(vegan, "shared")).toBe(true);
  });

  it("computes default participants by category", () => {
    const members = [
      { id: "alex", vegetarian: false, vegan: false, drinksAlcohol: true },
      { id: "cal", vegetarian: true, vegan: true, drinksAlcohol: false },
    ];
    expect(defaultParticipants(members, "meat")).toEqual(["alex"]);
    expect(defaultParticipants(members, "alcohol")).toEqual(["alex"]);
    expect(defaultParticipants(members, "shared").sort()).toEqual(["alex", "cal"]);
  });
});
