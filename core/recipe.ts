export type Recipe = {
  name: string;
  itemsNeeded: { item: string; amount: number }[];
  craftedItem: { item: string; amount: number };
  capstone?: boolean;
};

export const recipes: Recipe[] = [
  {
    name: "rope",
    itemsNeeded: [{ item: "grass", amount: 5 }],
    craftedItem: { item: "rope", amount: 1 },
  },
  {
    name: "raft",
    itemsNeeded: [{ item: "rope", amount: 3 }, { item: "branch", amount: 10 }],
    craftedItem: { item: "raft", amount: 1 },
  },
  {
    name: "scarf",
    itemsNeeded: [{ item: "grass", amount: 10 }, {
      item: "flower",
      amount: 10,
    }],
    craftedItem: { item: "scarf", amount: 1 },
  },
  {
    name: "nest",
    itemsNeeded: [
      { item: "grass", amount: 10 },
      { item: "reeds", amount: 30 },
      {
        item: "flower",
        amount: 10,
      },
      { item: "branch", amount: 10 },
    ],
    craftedItem: { item: "nest", amount: 1 },
  },
  {
    name: "winter food supply",
    itemsNeeded: [{ item: "frozen berries", amount: 30 }, {
      item: "acorn",
      amount: 10,
    }, {
      item: "seed",
      amount: 10,
    }],
    craftedItem: { item: "winter food supply", amount: 1 },
  },
  {
    name: "super ultra cozy winter",
    itemsNeeded: [{ item: "winter food supply", amount: 1 }, {
      item: "nest",
      amount: 1,
    }],
    craftedItem: { item: "super ultra cozy winter", amount: 1 },
    capstone: true,
  },
];
