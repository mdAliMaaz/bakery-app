import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UnitOfMeasurement {
  KG = 'Kg',
  LITER = 'Liter',
  NUMBER = 'Number',
  PACKET = 'Packet',
  GRAM = 'Gram',
  ML = 'ML',
  PIECE = 'Piece',
}

export interface IPurchaseEntry {
  quantity: number;
  cost: number;
  vendor?: string;
  date: Date;
  updatedBy: mongoose.Types.ObjectId;
}

export interface IInventoryItem extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  unit: UnitOfMeasurement;
  currentStock: number;
  thresholdValue: number;
  openingStock: number;
  openingStockDate: Date;
  purchaseHistory: IPurchaseEntry[];
  lastUpdated: Date;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseEntrySchema = new Schema<IPurchaseEntry>(
  {
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { _id: true }
);

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
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
InventoryItemSchema.index({ name: 1 });
InventoryItemSchema.index({ currentStock: 1 });

const InventoryItem: Model<IInventoryItem> =
  mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);

export default InventoryItem;

