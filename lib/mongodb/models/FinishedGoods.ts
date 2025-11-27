import mongoose, { Schema, Document, Model } from 'mongoose';

export enum TransactionType {
  PRODUCED = 'Produced',
  SOLD = 'Sold',
  ADJUSTED = 'Adjusted',
  WASTED = 'Wasted',
}

export interface IStockHistoryEntry {
  transactionType: TransactionType;
  quantity: number;
  date: Date;
  orderId?: mongoose.Types.ObjectId;
  notes?: string;
  updatedBy: mongoose.Types.ObjectId;
}

export interface IFinishedGoods extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  recipe: mongoose.Types.ObjectId;
  unit: string;
  currentStock: number;
  stockHistory: IStockHistoryEntry[];
  lastProducedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StockHistoryEntrySchema = new Schema<IStockHistoryEntry>(
  {
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
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    notes: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { _id: true }
);

const FinishedGoodsSchema = new Schema<IFinishedGoods>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      unique: true,
    },
    recipe: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
FinishedGoodsSchema.index({ name: 1 });
FinishedGoodsSchema.index({ recipe: 1 });

const FinishedGoods: Model<IFinishedGoods> =
  mongoose.models.FinishedGoods || mongoose.model<IFinishedGoods>('FinishedGoods', FinishedGoodsSchema);

export default FinishedGoods;

