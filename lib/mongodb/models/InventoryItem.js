"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitOfMeasurement = void 0;
var mongoose_1 = require("mongoose");
var UnitOfMeasurement;
(function (UnitOfMeasurement) {
    UnitOfMeasurement["KG"] = "Kg";
    UnitOfMeasurement["LITER"] = "Liter";
    UnitOfMeasurement["NUMBER"] = "Number";
    UnitOfMeasurement["PACKET"] = "Packet";
    UnitOfMeasurement["GRAM"] = "Gram";
    UnitOfMeasurement["ML"] = "ML";
    UnitOfMeasurement["PIECE"] = "Piece";
})(UnitOfMeasurement || (exports.UnitOfMeasurement = UnitOfMeasurement = {}));
var PurchaseEntrySchema = new mongoose_1.Schema({
    quantity: {
        type: Number,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    vendor: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { _id: true });
var InventoryItemSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        unique: true,
    },
    unit: {
        type: String,
        enum: Object.values(UnitOfMeasurement),
        required: [true, 'Unit of measurement is required'],
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    thresholdValue: {
        type: Number,
        required: [true, 'Threshold value is required'],
        min: 0,
    },
    openingStock: {
        type: Number,
        required: true,
        default: 0,
    },
    openingStockDate: {
        type: Date,
        default: Date.now,
    },
    purchaseHistory: [PurchaseEntrySchema],
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Index for efficient querying
InventoryItemSchema.index({ name: 1 });
InventoryItemSchema.index({ currentStock: 1 });
var InventoryItem = mongoose_1.default.models.InventoryItem || mongoose_1.default.model('InventoryItem', InventoryItemSchema);
exports.default = InventoryItem;
