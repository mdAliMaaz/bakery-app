import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import {
  Order,
  InventoryItem,
  FinishedGoods,
  UserRole,
  OrderStatus,
  TransactionType,
} from "@/lib/mongodb/models";
import { authorize, AuthenticatedRequest } from "@/lib/auth/middleware";

// POST update order status
async function postHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate status transition
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Helper function to get inventory item ID (handles both ObjectId and populated object)
    const getInventoryItemId = (ingredient: any): string => {
      if (typeof ingredient.inventoryItem === "string") {
        return ingredient.inventoryItem;
      }
      if (ingredient.inventoryItem?._id) {
        return ingredient.inventoryItem._id.toString();
      }
      return ingredient.inventoryItem?.toString() || ingredient.inventoryItem;
    };

    // Handle inventory updates based on status
    if (
      status === OrderStatus.INGREDIENTS_ALLOCATED &&
      order.status === OrderStatus.DRAFT
    ) {
      // Check if sufficient inventory is available
      for (const ingredient of order.totalIngredients) {
        const inventoryItemId = getInventoryItemId(ingredient);
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
              error: `Insufficient stock for ${item.name}. Required: ${ingredient.quantity}, Available: ${item.currentStock}`,
            },
            { status: 400 }
          );
        }
      }

      // Deduct inventory
      for (const ingredient of order.totalIngredients) {
        const inventoryItemId = getInventoryItemId(ingredient);
        await InventoryItem.findByIdAndUpdate(inventoryItemId, {
          $inc: { currentStock: -ingredient.quantity },
          $set: {
            lastUpdated: new Date(),
            updatedBy: req.user!.userId,
          },
        });
      }
    }

    // Handle cancellation - restore inventory if it was already allocated
    if (
      status === OrderStatus.CANCELLED &&
      order.status === OrderStatus.INGREDIENTS_ALLOCATED
    ) {
      for (const ingredient of order.totalIngredients) {
        const inventoryItemId = getInventoryItemId(ingredient);
        await InventoryItem.findByIdAndUpdate(inventoryItemId, {
          $inc: { currentStock: ingredient.quantity },
          $set: {
            lastUpdated: new Date(),
            updatedBy: req.user!.userId,
          },
        });
      }
    }

    // Handle finished goods updates based on status
    if (status === OrderStatus.READY_FOR_DISPATCH && order.status !== OrderStatus.READY_FOR_DISPATCH) {
      // Add to finished goods when order is ready for dispatch
      for (const item of order.items) {
        const finishedGoodsItem = await FinishedGoods.findOne({ recipe: item.recipe });
        if (finishedGoodsItem) {
          finishedGoodsItem.currentStock += item.quantity;
          finishedGoodsItem.lastProducedDate = new Date();
          finishedGoodsItem.stockHistory.push({
            transactionType: TransactionType.PRODUCED,
            quantity: item.quantity,
            date: new Date(),
            orderId: order._id,
            updatedBy: req.user!.userId,
            notes: `Produced for order ${order.orderNumber}`,
          });
          await finishedGoodsItem.save();
        }
      }
    } else if (status === OrderStatus.DELIVERED && order.status !== OrderStatus.DELIVERED) {
      // Deduct from finished goods when order is delivered
      for (const item of order.items) {
        const finishedGoodsItem = await FinishedGoods.findOne({ recipe: item.recipe });
        if (finishedGoodsItem && finishedGoodsItem.currentStock >= item.quantity) {
          finishedGoodsItem.currentStock -= item.quantity;
          finishedGoodsItem.stockHistory.push({
            transactionType: TransactionType.SOLD,
            quantity: -item.quantity,
            date: new Date(),
            orderId: order._id,
            updatedBy: req.user!.userId,
            notes: `Sold via order ${order.orderNumber}`,
          });
          await finishedGoodsItem.save();
        }
      }
    }

    // Update order status
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user!.userId as any,
      notes: notes || undefined,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("items.recipe", "name standardUnit")
      .populate("totalIngredients.inventoryItem", "name unit currentStock")
      .populate("createdBy", "name email")
      .populate("statusHistory.updatedBy", "name email");

    return NextResponse.json({
      message: "Order status updated successfully",
      order: populatedOrder,
    });
  } catch (error: any) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status", details: error.message },
      { status: 500 }
    );
  }
}

export const POST = authorize([UserRole.ADMIN, UserRole.STAFF])(postHandler);
