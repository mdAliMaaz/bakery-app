"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = void 0;
var mongoose_1 = require("mongoose");
var TransactionType;
(function (TransactionType) {
    TransactionType["PRODUCED"] = "Produced";
    TransactionType["SOLD"] = "Sold";
    TransactionType["ADJUSTED"] = "Adjusted";
    TransactionType["WASTED"] = "Wasted";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var StockHistoryEntrySchema = new mongoose_1.Schema({
    transactionType: {
        type: String,
        enum: Object.values(TransactionType),
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Order',
    },
    notes: {
        type: String,
        trim: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { _id: true });
var FinishedGoodsSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        unique: true,
    },
    recipe: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true,
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        trim: true,
    },
    currentStock: {
        type: Number,
        default: 0,
        min: 0,
    },
    stockHistory: [StockHistoryEntrySchema],
    lastProducedDate: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Index for efficient querying
FinishedGoodsSchema.index({ name: 1 });
FinishedGoodsSchema.index({ recipe: 1 });
var FinishedGoods = mongoose_1.default.models.FinishedGoods || mongoose_1.default.model('FinishedGoods', FinishedGoodsSchema);
exports.default = FinishedGoods;
