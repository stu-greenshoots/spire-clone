// Rules that decide, by default, which members are "in" on a line item based on
// its category and each member's dietary profile. These are only defaults —
// the UI always lets you override the participant list per item.

export type Category =
  | "shared"
  | "meat"
  | "fish"
  | "vegetarian"
  | "vegan"
  | "dairy"
  | "alcohol";

export const CATEGORIES: Category[] = [
  "shared",
  "meat",
  "fish",
  "vegetarian",
  "vegan",
  "dairy",
  "alcohol",
];

export interface DietProfile {
  vegetarian: boolean;
  vegan: boolean;
  drinksAlcohol: boolean;
}

/** Would this member, by default, eat/drink an item of the given category? */
export function consumes(member: DietProfile, category: Category): boolean {
  switch (category) {
    case "meat":
    case "fish":
      return !member.vegetarian && !member.vegan;
    case "dairy":
      return !member.vegan;
    case "alcohol":
      return member.drinksAlcohol;
    case "shared":
    case "vegetarian":
    case "vegan":
      return true;
    default:
      return true;
  }
}

/** Default participant ids for an item, given the trip's members. */
export function defaultParticipants<T extends DietProfile & { id: string }>(
  members: T[],
  category: Category
): string[] {
  return members.filter((m) => consumes(m, category)).map((m) => m.id);
}
