// Seeds a sample trip so you can see the item-level splitting in action.
// Run with: npm run seed
import { Store, type Category } from "./store.js";
import { defaultParticipants } from "./diet.js";

const store = new Store();
store.reset();

const trip = store.createTrip({ name: "Cabin Trip 2026" });

const alex = store.addMember({ tripId: trip.id, name: "Alex", drinksAlcohol: true });
const bo = store.addMember({ tripId: trip.id, name: "Bo", drinksAlcohol: true });
const cal = store.addMember({
  tripId: trip.id,
  name: "Cal",
  vegetarian: true,
  vegan: true,
  drinksAlcohol: false,
});
const members = [alex, bo, cal];

const itemDefs: { name: string; amountPence: number; category: Category }[] = [
  { name: "Teabags, oil, bread", amountPence: 600, category: "shared" },
  { name: "Ribeye steaks x3", amountPence: 1500, category: "meat" },
  { name: "Oat milk x2", amountPence: 350, category: "vegan" },
  { name: "Case of lager", amountPence: 1800, category: "alcohol" },
];

store.addExpense({
  tripId: trip.id,
  description: "Big Tesco shop",
  paidById: alex.id,
  date: new Date().toISOString(),
  source: "manual",
  items: itemDefs.map((it) => ({
    id: "",
    name: it.name,
    amountPence: it.amountPence,
    quantity: 1,
    category: it.category,
    participantIds: defaultParticipants(members, it.category),
  })),
});

console.log(`Seeded trip "${trip.name}" (id: ${trip.id}) with 3 members and 1 shop.`);
console.log(`Try: GET http://localhost:3001/trips/${trip.id}/balances`);
