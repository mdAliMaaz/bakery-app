"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var RecipeIngredientSchema = new mongoose_1.Schema({
    inventoryItem: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { _id: false });
var RecipeSchema = new mongoose_1.Schema({
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
            validator: function (v) {
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
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Index for efficient querying
RecipeSchema.index({ name: 1 });
var Recipe = mongoose_1.default.models.Recipe || mongoose_1.default.model('Recipe', RecipeSchema);
exports.default = Recipe;
