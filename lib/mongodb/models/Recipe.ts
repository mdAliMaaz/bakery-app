import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecipeIngredient {
  inventoryItem: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
}

export interface IRecipe extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  ingredients: IRecipeIngredient[];
  standardUnit: string;
  standardQuantity: number;
  unitPrice: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeIngredientSchema = new Schema<IRecipeIngredient>(
  {
    inventoryItem: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const RecipeSchema = new Schema<IRecipe>(
  {
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ingredients: {
      type: [RecipeIngredientSchema],
      required: true,
      validate: {
        validator: function (v: IRecipeIngredient[]) {
          return v.length > 0;
        },
        message: 'Recipe must have at least one ingredient',
      },
    },
    standardUnit: {
      type: String,
      required: [true, 'Standard unit is required'],
      trim: true,
    },
    standardQuantity: {
      type: Number,
      required: [true, 'Standard quantity is required'],
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: 0,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
RecipeSchema.index({ name: 1 });

const Recipe: Model<IRecipe> = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;

