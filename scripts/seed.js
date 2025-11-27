const mongoose = require("mongoose");
const connectDB = require("../lib/mongodb/connection").default;
const {
  User,
  UserRole,
  InventoryItem,
  UnitOfMeasurement,
  Recipe,
  Order,
  OrderStatus,
  FinishedGoods,
  TransactionType,
} = require("../lib/mongodb/models");

const randomFrom = (list) => list[Math.floor(Math.random() * list.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (days, hourOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() + hourOffset);
  return date;
};

const vendors = ["FreshFarm Co.", "Gourmet Supplies", "KitchenPro Wholesale", "Daily Dairy", "Global Spices"];
const customerNames = ["Luna Eats", "Savory Solutions", "Urban Bites", "Cozy Corner", "Sunset Catering", "Nimble Nosh"];

const inventoryBlueprint = [
  { name: "All-Purpose Flour", unit: UnitOfMeasurement.KG, thresholdValue: 15 },
  { name: "Mozzarella Cheese", unit: UnitOfMeasurement.KG, thresholdValue: 5 },
  { name: "Tomato Sauce", unit: UnitOfMeasurement.LITER, thresholdValue: 10 },
  { name: "Basil Leaves", unit: UnitOfMeasurement.GRAM, thresholdValue: 0.5 },
  { name: "Olive Oil", unit: UnitOfMeasurement.LITER, thresholdValue: 8 },
  { name: "Boneless Chicken", unit: UnitOfMeasurement.KG, thresholdValue: 12 },
  { name: "Spices Mix", unit: UnitOfMeasurement.GRAM, thresholdValue: 1 },
  { name: "Burger Buns", unit: UnitOfMeasurement.PACKET, thresholdValue: 20 },
  { name: "Cheddar Cheese", unit: UnitOfMeasurement.KG, thresholdValue: 6 },
  { name: "Roma Tomatoes", unit: UnitOfMeasurement.KG, thresholdValue: 9 },
  { name: "Onions", unit: UnitOfMeasurement.KG, thresholdValue: 10 },
  { name: "Garlic Paste", unit: UnitOfMeasurement.GRAM, thresholdValue: 2 },
];

const recipeBlueprint = [
  {
    name: "Classic Margherita Pizza",
    description: "Stone-baked pizza with tomatoes, mozzarella and basil.",
    standardUnit: "Piece",
    standardQuantity: 1,
    unitPrice: 425,
    ingredients: [
      { inventoryName: "All-Purpose Flour", quantity: 0.35, unit: "Kg" },
      { inventoryName: "Tomato Sauce", quantity: 0.2, unit: "Liter" },
      { inventoryName: "Mozzarella Cheese", quantity: 0.25, unit: "Kg" },
      { inventoryName: "Basil Leaves", quantity: 25, unit: "Gram" },
      { inventoryName: "Olive Oil", quantity: 0.02, unit: "Liter" },
    ],
  },
  {
    name: "Grilled Chicken Wrap",
    description: "Grilled chicken with salad and special sauce wrap.",
    standardUnit: "Piece",
    standardQuantity: 1,
    unitPrice: 375,
    ingredients: [
      { inventoryName: "Boneless Chicken", quantity: 0.3, unit: "Kg" },
      { inventoryName: "Spices Mix", quantity: 15, unit: "Gram" },
      { inventoryName: "Olive Oil", quantity: 0.015, unit: "Liter" },
      { inventoryName: "Burger Buns", quantity: 0.2, unit: "Packet" },
    ],
  },
  {
    name: "Cheesy Garlic Bread",
    description: "Freshly baked bread with garlic butter and cheese.",
    standardUnit: "Piece",
    standardQuantity: 1,
    unitPrice: 220,
    ingredients: [
      { inventoryName: "All-Purpose Flour", quantity: 0.25, unit: "Kg" },
      { inventoryName: "Garlic Paste", quantity: 20, unit: "Gram" },
      { inventoryName: "Cheddar Cheese", quantity: 0.2, unit: "Kg" },
      { inventoryName: "Olive Oil", quantity: 0.01, unit: "Liter" },
    ],
  },
  {
    name: "Zesty Tomato Soup",
    description: "Slow simmered Roma tomato soup with herbs.",
    standardUnit: "Liter",
    standardQuantity: 1,
    unitPrice: 260,
    ingredients: [
      { inventoryName: "Roma Tomatoes", quantity: 1, unit: "Kg" },
      { inventoryName: "Onions", quantity: 0.2, unit: "Kg" },
      { inventoryName: "Olive Oil", quantity: 0.015, unit: "Liter" },
      { inventoryName: "Spices Mix", quantity: 10, unit: "Gram" },
    ],
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please set MONGODB_URI env variable before running the seed script.");
  }

  await connectDB();
  console.log("Connected to MongoDB");

  await Promise.all([
    User.deleteMany({}),
    InventoryItem.deleteMany({}),
    Recipe.deleteMany({}),
    FinishedGoods.deleteMany({}),
    Order.deleteMany({}),
  ]);
  console.log("Cleared existing collections");

  const users = await User.create([
    { name: "Ava Admin", email: "ava.admin@example.com", password: "password123", role: UserRole.ADMIN },
    { name: "Sam Staff", email: "sam.staff@example.com", password: "password123", role: UserRole.STAFF },
    { name: "Vera Viewer", email: "vera.viewer@example.com", password: "password123", role: UserRole.VIEWER },
  ]);

  const inventoryItems = await InventoryItem.create(
    inventoryBlueprint.map((item) => {
      const updatedBy = randomFrom(users)._id;
      const openingStock = randomInt(50, 120);
      const purchaseHistory = Array.from({ length: randomInt(2, 4) }).map(() => ({
        quantity: randomInt(10, 30),
        cost: randomInt(100, 450),
        vendor: randomFrom(vendors),
        date: daysAgo(randomInt(1, 7), randomInt(0, 12)),
        updatedBy,
      }));
      const currentStock = Math.max(
        openingStock +
          purchaseHistory.reduce((sum, entry) => sum + entry.quantity, 0) -
          randomInt(20, 60),
        0
      );
      return {
        ...item,
        openingStock,
        currentStock,
        openingStockDate: daysAgo(7),
        purchaseHistory,
        lastUpdated: daysAgo(randomInt(0, 2)),
        updatedBy,
      };
    })
  );

  const inventoryMap = new Map(inventoryItems.map((item) => [item.name, item]));

  const recipes = await Recipe.create(
    recipeBlueprint.map((recipe) => ({
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients
        .map((ingredient) => {
          const linkedInventory = inventoryMap.get(ingredient.inventoryName);
          if (!linkedInventory) {
            return null;
          }
          return {
            inventoryItem: linkedInventory._id,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          };
        })
        .filter(Boolean),
      standardUnit: recipe.standardUnit,
      standardQuantity: recipe.standardQuantity,
      unitPrice: recipe.unitPrice,
      createdBy: randomFrom(users)._id,
    }))
  );

  const finishedGoodsDocs = await FinishedGoods.create(
    recipes.map((recipe) => {
      const currentStock = randomInt(30, 120);
      const updatedBy = randomFrom(users)._id;
      const stockHistory = Array.from({ length: 7 }).flatMap((_, dayIndex) => {
        const producedQty = randomInt(20, 60);
        const soldQty = randomInt(10, producedQty);
        return [
          {
            transactionType: TransactionType.PRODUCED,
            quantity: producedQty,
            date: daysAgo(dayIndex, randomInt(6, 10)),
            notes: `Batch produced for day-${dayIndex}`,
            updatedBy,
          },
          {
            transactionType: TransactionType.SOLD,
            quantity: soldQty,
            date: daysAgo(dayIndex, randomInt(12, 18)),
            notes: `Sold to client order set ${dayIndex}`,
            updatedBy,
          },
        ];
      });
      return {
        name: `${recipe.name} Batch`,
        recipe: recipe._id,
        unit: recipe.standardUnit,
        currentStock,
        lastProducedDate: daysAgo(randomInt(0, 1)),
        stockHistory,
      };
    })
  );

  const daysToGenerate = 7;
  const ordersToCreate = [];

  for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
    const dailyOrderCount = randomInt(4, 9);
    for (let idx = 0; idx < dailyOrderCount; idx++) {
      const items = Array.from({ length: randomInt(1, recipes.length) }).map(() => {
        const recipe = randomFrom(recipes);
        const quantity = randomInt(1, 4);
        const unitPrice = recipe.unitPrice || randomInt(180, 600);
        return {
          recipe: recipe._id,
          quantity,
          recipeName: recipe.name,
          unitPrice,
          lineTotal: unitPrice * quantity,
        };
      });

      const totalIngredientsMap = new Map();
      items.forEach((item) => {
        const recipe = recipes.find((r) => r._id.equals(item.recipe));
        recipe?.ingredients.forEach((ing) => {
          const key = ing.inventoryItem.toString();
          const newQuantity = item.quantity * ing.quantity;
          if (totalIngredientsMap.has(key)) {
            totalIngredientsMap.get(key).quantity += newQuantity;
          } else {
            totalIngredientsMap.set(key, {
              inventoryItem: ing.inventoryItem,
              quantity: newQuantity,
              unit: ing.unit,
            });
          }
        });
      });

      const orderDate = daysAgo(dayOffset, randomInt(8, 12));
      const createdBy = randomFrom(users)._id;
      const statusTimeline = [
        { status: OrderStatus.DRAFT, offsetHours: 0, notes: "Order drafted" },
        { status: OrderStatus.INGREDIENTS_ALLOCATED, offsetHours: 2, notes: "Ingredients reserved" },
        { status: OrderStatus.IN_PRODUCTION, offsetHours: 5, notes: "Kitchen started" },
        { status: OrderStatus.READY_FOR_DISPATCH, offsetHours: 16, notes: "Packed and ready" },
        { status: OrderStatus.DISPATCHED, offsetHours: 20, notes: "Courier picked up" },
        { status: OrderStatus.DELIVERED, offsetHours: 28, notes: "Delivered to client" },
      ];

      const maxStatusIndex = dayOffset >= 2 ? statusTimeline.length : randomInt(3, statusTimeline.length - 1);
      const statusHistory = statusTimeline.slice(0, maxStatusIndex).map((entry) => ({
        status: entry.status,
        timestamp: new Date(orderDate.getTime() + entry.offsetHours * 60 * 60 * 1000),
        updatedBy: createdBy,
        notes: entry.notes,
      }));

      const latestStatus = statusHistory[statusHistory.length - 1].status;
      const deliveryDate =
        latestStatus === OrderStatus.DELIVERED
          ? new Date(orderDate.getTime() + randomInt(30, 40) * 60 * 60 * 1000)
          : undefined;

      const itemsTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

      ordersToCreate.push({
        customer: {
          name: randomFrom(customerNames),
          phoneNumber: `+1-202-555-${randomInt(1000, 9999)}`,
          address: `${randomInt(100, 999)} ${randomFrom(["Maple", "Cedar", "Pine", "Oak"])} Street`,
          email: `orders+${randomInt(1, 500)}@${randomFrom(["lunaeats", "urbanbites", "savorysolutions"])}.com`,
        },
        items,
        totalIngredients: Array.from(totalIngredientsMap.values()),
        itemsTotal,
        currency: "INR",
        status: latestStatus,
        statusHistory,
        orderDate,
        deliveryDate,
        notes: `Auto generated on ${orderDate.toDateString()}`,
        createdBy,
      });
    }
  }

  const orders = await Order.create(ordersToCreate);

  console.log(
    `Seeded last ${daysToGenerate} days: ${users.length} users, ${inventoryItems.length} inventory items, ${recipes.length} recipes, ${finishedGoodsDocs.length} finished goods, ${orders.length} orders.`
  );

  await mongoose.connection.close();
  console.log("Disconnected from MongoDB. Seeding complete.");
}

seed().catch((error) => {
  console.error("Seed script failed:", error);
  mongoose.connection.close().finally(() => process.exit(1));
});
