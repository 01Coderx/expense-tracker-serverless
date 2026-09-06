import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/server/db";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { Transaction, type Category } from "@/lib/server/models/Transaction";
import { unauthorizedResponse, jsonError, isValidDate } from "@/lib/server/http";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

const categories: Category[] = [
  "Food",
  "Groceries",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Finance",
  "Salary",
  "Other",
];

function validCategory(value: unknown): value is Category {
  return typeof value === "string" && categories.includes(value as Category);
}

async function getContext(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  await connectDB();
  const user = await getAuthenticatedUser();

  return { user };
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const context = await getContext(id);

    if (!context) {
      return jsonError("Transaction not found.", 404);
    }

    const body = await request.json().catch(() => ({}));
    const { text, amount, category, createdAt } = body ?? {};

    if (!text || amount === undefined || !createdAt) {
      return jsonError("Text, amount and date are required.", 400);
    }

    if (!isValidDate(createdAt)) {
      return jsonError("Date must be valid.", 400);
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return jsonError("Amount must be a valid number.", 400);
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: context.user.id,
    });

    if (!transaction) {
      return jsonError("Transaction not found.", 404);
    }

    transaction.text = String(text).trim();
    transaction.amount = numericAmount;
    transaction.category = validCategory(category) ? category : "Other";
    transaction.createdAt = new Date(createdAt);

    await transaction.save();

    return NextResponse.json({
      success: true,
      message: "Transaction updated successfully.",
      data: transaction,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }

    console.error("Update transaction error:", error);
    return jsonError("Server error while updating transaction.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const context = await getContext(id);

    if (!context) {
      return jsonError("Transaction not found.", 404);
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: context.user.id,
    });

    if (!transaction) {
      return jsonError("Transaction not found.", 404);
    }

    await transaction.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }

    console.error("Delete transaction error:", error);
    return jsonError("Server error while deleting transaction.");
  }
}
