"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var mongoose_1 = require("mongoose");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["DRAFT"] = "Draft";
    OrderStatus["INGREDIENTS_ALLOCATED"] = "Ingredients Allocated";
    OrderStatus["IN_PRODUCTION"] = "In Production";
    OrderStatus["READY_FOR_DISPATCH"] = "Ready for Dispatch";
    OrderStatus["DISPATCHED"] = "Dispatched";
    OrderStatus["DELIVERED"] = "Delivered";
    OrderStatus["CANCELLED"] = "Cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderItemSchema = new mongoose_1.Schema({
    recipe: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Recipe",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    recipeName: {
        type: String,
    },
}, { _id: false });
var CustomerDetailsSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
}, { _id: false });
var StatusHistorySchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    notes: {
        type: String,
        trim: true,
    },
}, { _id: false });
var OrderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: false,
        unique: true,
    },
    customer: {
        type: CustomerDetailsSchema,
        required: true,
    },
    items: {
        type: [OrderItemSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: "Order must have at least one item",
        },
    },
    totalIngredients: [
        {
            inventoryItem: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "InventoryItem",
            },
            quantity: Number,
            unit: String,
        },
    ],
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.DRAFT,
    },
    statusHistory: [StatusHistorySchema],
    orderDate: {
        type: Date,
        default: Date.now,
    },
    deliveryDate: {
        type: Date,
    },
    notes: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
// Auto-generate deterministic but unique-ish order number
OrderSchema.pre("save", function (next) {
    if (this.isNew && !this.orderNumber) {
        var randomPart = Math.random().toString(36).slice(-6).toUpperCase();
        this.orderNumber = "ORD-".concat(Date.now(), "-").concat(randomPart);
    }
                    next();
});
// Index for efficient querying
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
var Order = mongoose_1.default.models.Order || mongoose_1.default.model("Order", OrderSchema);
exports.default = Order;
