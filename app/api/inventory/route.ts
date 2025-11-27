import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { InventoryItem, UserRole } from "@/lib/mongodb/models";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "@/lib/auth/middleware";

// GET all inventory items
async function getHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lowStock = searchParams.get("lowStock") === "true";

    let query = {};

    if (lowStock) {
      // Find items where currentStock is less than or equal to threshold
      query = { $expr: { $lte: ["$currentStock", "$thresholdValue"] } };
    }

    const items = await InventoryItem.find(query)
      .populate("updatedBy", "name email")
      .sort({ name: 1 });

    return NextResponse.json({
      items,
      count: items.length,
    });
  } catch (error: any) {
    console.error("Get inventory items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory items", details: error.message },
      { status: 500 }
    );
  }
}

// POST create new inventory item
async function postHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, unit, currentStock, thresholdValue, openingStock } = body;

    // Validation
    if (!name || !unit || thresholdValue === undefined) {
      return NextResponse.json(
        { error: "Name, unit, and threshold value are required" },
        { status: 400 }
      );
    }

    // Check if item already exists
    const existingItem = await InventoryItem.findOne({ name: name.trim() });
    if (existingItem) {
      return NextResponse.json(
        { error: "Item with this name already exists" },
        { status: 409 }
      );
    }

    const item = await InventoryItem.create({
      name: name.trim(),
      unit,
      currentStock: currentStock || openingStock || 0,
      thresholdValue,
      openingStock: openingStock || currentStock || 0,
      openingStockDate: new Date(),
      updatedBy: req.user!.userId,
      lastUpdated: new Date(),
    });

    const populatedItem = await InventoryItem.findById(item._id).populate(
      "updatedBy",
      "name email"
    );

    return NextResponse.json(
      {
        message: "Inventory item created successfully",
        item: populatedItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create inventory item error:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(getHandler);
export const POST = authorize([UserRole.ADMIN, UserRole.STAFF])(postHandler);
