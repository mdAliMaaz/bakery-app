import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { FinishedGoods, UserRole, TransactionType } from "@/lib/mongodb/models";
import { authorize, AuthenticatedRequest } from "@/lib/auth/middleware";

// POST add stock transaction
async function postHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { transactionType, quantity, notes, orderId } = body;

    // Validation
    if (!transactionType || quantity === undefined) {
      return NextResponse.json(
        { error: "Transaction type and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    const validTypes = Object.values(TransactionType);
    if (!validTypes.includes(transactionType)) {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const finishedGoods = await FinishedGoods.findById(id);

    if (!finishedGoods) {
      return NextResponse.json(
        { error: "Finished goods item not found" },
        { status: 404 }
      );
    }

    // Calculate stock change based on transaction type
    let stockChange = 0;
    if (
      transactionType === TransactionType.PRODUCED ||
      transactionType === TransactionType.ADJUSTED
    ) {
      stockChange = quantity;
    } else if (
      transactionType === TransactionType.SOLD ||
      transactionType === TransactionType.WASTED
    ) {
      stockChange = -quantity;

      // Check if sufficient stock is available
      if (finishedGoods.currentStock < quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock. Available: ${finishedGoods.currentStock}, Required: ${quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Add transaction to history
    finishedGoods.stockHistory.push({
      transactionType,
      quantity,
      date: new Date(),
      orderId: orderId || undefined,
      notes: notes || undefined,
      updatedBy: req.user!.userId as any,
    });

    // Update current stock
    finishedGoods.currentStock += stockChange;

    // Update last produced date if transaction is production
    if (transactionType === TransactionType.PRODUCED) {
      finishedGoods.lastProducedDate = new Date();
    }

    await finishedGoods.save();

    const populatedItem = await FinishedGoods.findById(finishedGoods._id)
      .populate("recipe", "name ingredients standardUnit")
      .populate("stockHistory.updatedBy", "name email")
      .populate("stockHistory.orderId", "orderNumber");

    return NextResponse.json({
      message: "Stock transaction added successfully",
      finishedGoods: populatedItem,
    });
  } catch (error: any) {
    console.error("Add stock transaction error:", error);
    return NextResponse.json(
      { error: "Failed to add stock transaction", details: error.message },
      { status: 500 }
    );
  }
}

export const POST = authorize([UserRole.ADMIN, UserRole.STAFF])(postHandler);
