import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import { Recipe, UserRole } from "@/lib/mongodb/models";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "@/lib/auth/middleware";

// GET single recipe
async function getHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const recipe = await Recipe.findById(id)
      .populate("ingredients.inventoryItem", "name unit currentStock")
      .populate("createdBy", "name email");

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ recipe });
  } catch (error: any) {
    console.error("Get recipe error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe", details: error.message },
      { status: 500 }
    );
  }
}

// PUT update recipe
async function putHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      name,
      description,
      ingredients,
      standardUnit,
      standardQuantity,
      unitPrice,
    } = body;

    const { id } = await params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Update fields
    if (name !== undefined) recipe.name = name.trim();
    if (description !== undefined) recipe.description = description;
    if (ingredients !== undefined) recipe.ingredients = ingredients;
    if (standardUnit !== undefined) recipe.standardUnit = standardUnit;
    if (standardQuantity !== undefined)
      recipe.standardQuantity = standardQuantity;
    if (unitPrice !== undefined) {
      if (Number(unitPrice) < 0) {
        return NextResponse.json(
          { error: "Unit price must be a positive number" },
          { status: 400 }
        );
      }
      recipe.unitPrice = Number(unitPrice);
    }

    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate("ingredients.inventoryItem", "name unit")
      .populate("createdBy", "name email");

    return NextResponse.json({
      message: "Recipe updated successfully",
      recipe: populatedRecipe,
    });
  } catch (error: any) {
    console.error("Update recipe error:", error);
    return NextResponse.json(
      { error: "Failed to update recipe", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE recipe
async function deleteHandler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Recipe deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete recipe error:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(getHandler);
export const PUT = authorize([UserRole.ADMIN, UserRole.STAFF])(putHandler);
export const DELETE = authorize([UserRole.ADMIN])(deleteHandler);
