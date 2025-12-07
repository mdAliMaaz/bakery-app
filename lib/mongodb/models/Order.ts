import mongoose, { Schema, Document, Model } from "mongoose";

export enum OrderStatus {
  DRAFT = "Draft",
  INGREDIENTS_ALLOCATED = "Ingredients Allocated",
  IN_PRODUCTION = "In Production",
  READY_FOR_DISPATCH = "Ready for Dispatch",
  DISPATCHED = "Dispatched",
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled",
}

export interface IOrderItem {
  recipe: mongoose.Types.ObjectId;
  quantity: number;
  recipeName?: string;
}

export interface ICustomerDetails {
  name: string;
  phoneNumber: string;
  address?: string;
  email?: string;
}

export interface IStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  updatedBy: mongoose.Types.ObjectId;
  notes?: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customer: ICustomerDetails;
  items: IOrderItem[];
  totalIngredients: {
    inventoryItem: mongoose.Types.ObjectId;
    quantity: number;
    unit: string;
  }[];
  status: OrderStatus;
  statusHistory: IStatusHistory[];
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    recipe: {
      type: Schema.Types.ObjectId,
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
  },
  { _id: false }
);

const CustomerDetailsSchema = new Schema<ICustomerDetails>(
  {
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
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
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
        validator: function (v: IOrderItem[]) {
          return v.length > 0;
        },
        message: "Order must have at least one item",
      },
    },
    totalIngredients: [
      {
        inventoryItem: {
          type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate deterministic but unique-ish order number
OrderSchema.pre("save", function (next) {
  if (this.isNew && !this.orderNumber) {
    const randomPart = Math.random().toString(36).slice(-6).toUpperCase();
    this.orderNumber = `ORD-${Date.now()}-${randomPart}`;
  }
  next();
});

// Index for efficient querying
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
