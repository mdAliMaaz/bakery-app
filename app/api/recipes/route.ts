import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { Recipe, UserRole } from '@/lib/mongodb/models';
import { authenticate, authorize, AuthenticatedRequest } from '@/lib/auth/middleware';

// GET all recipes
async function getHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const recipes = await Recipe.find()
      .populate('ingredients.inventoryItem', 'name unit')
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    return NextResponse.json({
      recipes,
      count: recipes.length,
    });
  } catch (error: any) {
    console.error('Get recipes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes', details: error.message },
      { status: 500 }
    );
  }
}

// POST create new recipe
async function postHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, description, ingredients, standardUnit, standardQuantity, unitPrice } = body;

    // Validation
    if (!name || !ingredients || !standardUnit) {
      return NextResponse.json(
        { error: 'Name, ingredients, and standard unit are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Recipe must have at least one ingredient' },
        { status: 400 }
      );
    }

    if (unitPrice === undefined || unitPrice === null || Number(unitPrice) < 0) {
      return NextResponse.json(
        { error: 'Unit price is required and must be a positive number' },
        { status: 400 }
      );
    }

    // Check if recipe already exists
    const existingRecipe = await Recipe.findOne({ name: name.trim() });
    if (existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe with this name already exists' },
        { status: 409 }
      );
    }

    const recipe = await Recipe.create({
      name: name.trim(),
      description: description || undefined,
      ingredients,
      standardUnit,
      standardQuantity: standardQuantity || 1,
      unitPrice: Number(unitPrice),
      createdBy: req.user!.userId,
    });

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('ingredients.inventoryItem', 'name unit')
      .populate('createdBy', 'name email');

    return NextResponse.json(
      {
        message: 'Recipe created successfully',
        recipe: populatedRecipe,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create recipe error:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe', details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(getHandler);
export const POST = authorize([UserRole.ADMIN, UserRole.STAFF])(postHandler);

