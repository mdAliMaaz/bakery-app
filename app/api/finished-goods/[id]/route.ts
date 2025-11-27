import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { FinishedGoods, UserRole } from "@/lib/mongodb/models";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "@/lib/auth/middleware";

// GET single finished goods item
async function getHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const finishedGoods = await FinishedGoods.findById(id)
      .populate("recipe", "name ingredients standardUnit")
      .populate("stockHistory.updatedBy", "name email")
      .populate("stockHistory.orderId", "orderNumber customer");

    if (!finishedGoods) {
      return NextResponse.json(
        { error: "Finished goods item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ finishedGoods });
  } catch (error: any) {
    console.error("Get finished goods error:", error);
    return NextResponse.json(
      { error: "Failed to fetch finished goods item", details: error.message },
      { status: 500 }
    );
  }
}

// PUT update finished goods item
async function putHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, recipe, unit } = body;

    const { id } = await params;
    const finishedGoods = await FinishedGoods.findById(id);

    if (!finishedGoods) {
      return NextResponse.json(
        { error: "Finished goods item not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (name !== undefined) finishedGoods.name = name.trim();
    if (recipe !== undefined) finishedGoods.recipe = recipe;
    if (unit !== undefined) finishedGoods.unit = unit;

    await finishedGoods.save();

    const populatedItem = await FinishedGoods.findById(finishedGoods._id)
      .populate("recipe", "name ingredients standardUnit")
      .populate("stockHistory.updatedBy", "name email");

    return NextResponse.json({
      message: "Finished goods item updated successfully",
      finishedGoods: populatedItem,
    });
  } catch (error: any) {
    console.error("Update finished goods error:", error);
    return NextResponse.json(
      { error: "Failed to update finished goods item", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE finished goods item
async function deleteHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const finishedGoods = await FinishedGoods.findByIdAndDelete(id);

    if (!finishedGoods) {
      return NextResponse.json(
        { error: "Finished goods item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Finished goods item deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete finished goods error:", error);
    return NextResponse.json(
      { error: "Failed to delete finished goods item", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(getHandler);
export const PUT = authorize([UserRole.ADMIN, UserRole.STAFF])(putHandler);
export const DELETE = authorize([UserRole.ADMIN])(deleteHandler);
