import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { InventoryItem, UserRole } from "@/lib/mongodb/models";
import { authorize, AuthenticatedRequest } from "@/lib/auth/middleware";

// POST add purchase entry
async function postHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { quantity, cost, vendor } = body;

    // Validation
    if (quantity === undefined || cost === undefined) {
      return NextResponse.json(
        { error: "Quantity and cost are required" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const item = await InventoryItem.findById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Add purchase entry
    item.purchaseHistory.push({
      quantity,
      cost,
      vendor: vendor || undefined,
      date: new Date(),
      updatedBy: req.user!.userId as any,
    });

    // Update current stock
    item.currentStock += quantity;
    item.lastUpdated = new Date();
    item.updatedBy = req.user!.userId as any;

    await item.save();

    const populatedItem = await InventoryItem.findById(item._id)
      .populate("updatedBy", "name email")
      .populate("purchaseHistory.updatedBy", "name email");

    return NextResponse.json({
      message: "Purchase entry added successfully",
      item: populatedItem,
    });
  } catch (error: any) {
    console.error("Add purchase entry error:", error);
    return NextResponse.json(
      { error: "Failed to add purchase entry", details: error.message },
      { status: 500 }
    );
  }
}

export const POST = authorize([UserRole.ADMIN, UserRole.STAFF])(postHandler);
