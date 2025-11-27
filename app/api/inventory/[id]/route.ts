import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { InventoryItem, UserRole } from "@/lib/mongodb/models";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "@/lib/auth/middleware";

// GET single inventory item
async function getHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const item = await InventoryItem.findById(id)
      .populate("updatedBy", "name email")
      .populate("purchaseHistory.updatedBy", "name email");

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error("Get inventory item error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory item", details: error.message },
      { status: 500 }
    );
  }
}

// PUT update inventory item
async function putHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, unit, currentStock, thresholdValue } = body;

    const { id } = await params;
    const item = await InventoryItem.findById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update fields
    if (name !== undefined) item.name = name.trim();
    if (unit !== undefined) item.unit = unit;
    if (currentStock !== undefined) item.currentStock = currentStock;
    if (thresholdValue !== undefined) item.thresholdValue = thresholdValue;

    item.updatedBy = req.user!.userId as any;
    item.lastUpdated = new Date();

    await item.save();

    const populatedItem = await InventoryItem.findById(item._id).populate(
      "updatedBy",
      "name email"
    );

    return NextResponse.json({
      message: "Inventory item updated successfully",
      item: populatedItem,
    });
  } catch (error: any) {
    console.error("Update inventory item error:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE inventory item
async function deleteHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const item = await InventoryItem.findByIdAndDelete(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Inventory item deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete inventory item error:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(getHandler);
export const PUT = authorize([UserRole.ADMIN, UserRole.STAFF])(putHandler);
export const DELETE = authorize([UserRole.ADMIN])(deleteHandler);
