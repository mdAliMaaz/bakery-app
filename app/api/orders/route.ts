import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import {
  Order,
  Recipe,
  InventoryItem,
  UserRole,
  OrderStatus,
} from "@/lib/mongodb/models";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "@/lib/auth/middleware";

// Helper function to calculate total ingredients from order items
// This calculates proportionally based on recipe's standardQuantity
// Example: Recipe needs 10 mangos for 2 cakes, order is for 1 cake
// Calculation: (10 / 2) * 1 = 5 mangos
async function calculateTotalIngredients(items: any[]) {
  const ingredientMap = new Map();

  for (const item of items) {
    const recipe = await Recipe.findById(item.recipe).populate(
      "ingredients.inventoryItem"
    );

    if (!recipe) {
      throw new Error(`Recipe not found: ${item.recipe}`);
    }

    // Get the recipe's standard quantity (e.g., 2 cakes)
    const standardQuantity = recipe.standardQuantity || 1;

    // Calculate ingredients proportionally based on order quantity
    // Formula: (ingredient.quantity / recipe.standardQuantity) * order.quantity
    for (const ingredient of recipe.ingredients) {
      const key = ingredient.inventoryItem._id.toString();
      
      // Calculate proportional quantity per unit, then multiply by order quantity
      const quantityPerUnit = ingredient.quantity / standardQuantity;
      const totalQuantity = quantityPerUnit * item.quantity;

      if (ingredientMap.has(key)) {
        ingredientMap.get(key).quantity += totalQuantity;
      } else {
        ingredientMap.set(key, {
          inventoryItem: ingredient.inventoryItem._id,
          quantity: totalQuantity,
          unit: ingredient.unit,
        });
      }
    }
  }

  return Array.from(ingredientMap.values());
}

// GET all orders
async function getHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate("items.recipe", "name standardUnit")
      .populate("totalIngredients.inventoryItem", "name unit")
      .populate("createdBy", "name email")
      .sort({ orderDate: -1 });

    return NextResponse.json({
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

// POST create new order
async function postHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { customer, items, deliveryDate, notes } = body;

    // Validation
    if (!customer || !customer.name || !customer.phoneNumber) {
      return NextResponse.json(
        { error: "Customer name and phone number are required" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    // Calculate total ingredients
    const totalIngredients = await calculateTotalIngredients(items);

    // Validate inventory stock availability before creating order
    for (const ingredient of totalIngredients) {
      const inventoryItemId =
        typeof ingredient.inventoryItem === "string"
          ? ingredient.inventoryItem
          : ingredient.inventoryItem?.toString() || ingredient.inventoryItem;

      const item = await InventoryItem.findById(inventoryItemId);

      if (!item) {
        return NextResponse.json(
          { error: `Inventory item not found: ${inventoryItemId}` },
          { status: 404 }
        );
      }

      if (item.currentStock < ingredient.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.name}. Required: ${ingredient.quantity} ${ingredient.unit}, Available: ${item.currentStock} ${item.unit}`,
            details: {
              itemName: item.name,
              required: ingredient.quantity,
              available: item.currentStock,
              unit: ingredient.unit,
            },
          },
          { status: 400 }
        );
      }
    }

    const order = await Order.create({
      customer,
      items,
      totalIngredients,
      status: OrderStatus.DRAFT,
      statusHistory: [
        {
          status: OrderStatus.DRAFT,
          timestamp: new Date(),
          updatedBy: req.user!.userId,
        },
      ],
      orderDate: new Date(),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      notes: notes || undefined,
      createdBy: req.user!.userId,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("items.recipe", "name standardUnit")
      .populate("totalIngredients.inventoryItem", "name unit")
      .populate("createdBy", "name email");

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: populatedOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(getHandler);
export const POST = authorize([UserRole.ADMIN, UserRole.STAFF])(postHandler);
