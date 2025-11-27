import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { FinishedGoods, UserRole } from "@/lib/mongodb/models";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "@/lib/auth/middleware";

// GET all finished goods
async function getHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const finishedGoods = await FinishedGoods.find()
      .populate("recipe", "name ingredients standardUnit")
      .populate("stockHistory.updatedBy", "name email")
      .populate("stockHistory.orderId", "orderNumber")
      .sort({ name: 1 });

    return NextResponse.json({
      finishedGoods,
      count: finishedGoods.length,
    });
  } catch (error: any) {
    console.error("Get finished goods error:", error);
    return NextResponse.json(
      { error: "Failed to fetch finished goods", details: error.message },
      { status: 500 }
    );
  }
}

// POST create new finished goods item
async function postHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, recipe, unit, currentStock } = body;

    // Validation
    if (!name || !recipe || !unit) {
      return NextResponse.json(
        { error: "Name, recipe, and unit are required" },
        { status: 400 }
      );
    }

    // Check if item already exists
    const existingItem = await FinishedGoods.findOne({ name: name.trim() });
    if (existingItem) {
      return NextResponse.json(
        { error: "Finished goods item with this name already exists" },
        { status: 409 }
      );
    }

    const finishedGoods = await FinishedGoods.create({
      name: name.trim(),
      recipe,
      unit,
      currentStock: currentStock || 0,
      stockHistory:
        currentStock > 0
          ? [
              {
                transactionType: "Produced",
                quantity: currentStock,
                date: new Date(),
                updatedBy: req.user!.userId,
              },
            ]
          : [],
    });

    const populatedItem = await FinishedGoods.findById(finishedGoods._id)
      .populate("recipe", "name ingredients standardUnit")
      .populate("stockHistory.updatedBy", "name email");

    return NextResponse.json(
      {
        message: "Finished goods item created successfully",
        finishedGoods: populatedItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create finished goods error:", error);
    return NextResponse.json(
      { error: "Failed to create finished goods item", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(getHandler);
export const POST = authorize([UserRole.ADMIN, UserRole.STAFF])(postHandler);
