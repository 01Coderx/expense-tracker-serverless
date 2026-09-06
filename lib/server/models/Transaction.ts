import mongoose, { Schema, type Model } from "mongoose";

export type Category =
  | "Food"
  | "Groceries"
  | "Transport"
  | "Bills"
  | "Shopping"
  | "Health"
  | "Finance"
  | "Salary"
  | "Other";

export type TransactionDocument = {
  text: string;
  amount: number;
  category: Category;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const transactionSchema = new Schema<TransactionDocument>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Food",
        "Groceries",
        "Transport",
        "Bills",
        "Shopping",
        "Health",
        "Finance",
        "Salary",
        "Other",
      ],
      default: "Other",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction =
  (mongoose.models.Transaction as Model<TransactionDocument> | undefined) ??
  mongoose.model<TransactionDocument>("Transaction", transactionSchema);
