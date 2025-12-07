import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { Order, Recipe, UserRole, OrderStatus } from "@/lib/mongodb/models";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "@/lib/auth/middleware";

// Helper function to calculate total ingredients
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

// GET single order
async function getHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const order = await Order.findById(id)
      .populate("items.recipe", "name standardUnit")
      .populate("totalIngredients.inventoryItem", "name unit currentStock")
      .populate("createdBy", "name email")
      .populate("statusHistory.updatedBy", "name email");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order", details: error.message },
      { status: 500 }
    );
  }
}

// PUT update order
async function putHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { customer, items, deliveryDate, notes } = body;

    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow modifications if order is in Draft status
    if (order.status !== OrderStatus.DRAFT) {
      return NextResponse.json(
        { error: "Can only modify orders in Draft status" },
        { status: 400 }
      );
    }

    // Update fields
    if (customer !== undefined) order.customer = customer;
    if (deliveryDate !== undefined)
      order.deliveryDate = deliveryDate ? new Date(deliveryDate) : undefined;
    if (notes !== undefined) order.notes = notes;

    // If items are updated, recalculate ingredients
    if (items !== undefined) {
      order.items = items;
      order.totalIngredients = await calculateTotalIngredients(items);
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("items.recipe", "name standardUnit")
      .populate("totalIngredients.inventoryItem", "name unit")
      .populate("createdBy", "name email");

    return NextResponse.json({
      message: "Order updated successfully",
      order: populatedOrder,
    });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE order
async function deleteHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow deletion if order is in Draft or Cancelled status
    if (
      order.status !== OrderStatus.DRAFT &&
      order.status !== OrderStatus.CANCELLED
    ) {
      return NextResponse.json(
        { error: "Can only delete orders in Draft or Cancelled status" },
        { status: 400 }
      );
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(getHandler);
export const PUT = authorize([UserRole.ADMIN, UserRole.STAFF])(putHandler);
export const DELETE = authorize([UserRole.ADMIN])(deleteHandler);
