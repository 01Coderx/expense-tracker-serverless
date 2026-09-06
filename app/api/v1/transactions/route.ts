import { NextResponse } from "next/server";
import { connectDB } from "@/lib/server/db";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { Transaction, type Category } from "@/lib/server/models/Transaction";
import { unauthorizedResponse, jsonError, isValidDate } from "@/lib/server/http";

export const runtime = "nodejs";

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

export async function GET() {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    const transactions = await Transaction.find({
      user: user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }

    console.error("Get transactions error:", error);
    return jsonError("Server error while fetching transactions.");
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    const body = await request.json().catch(() => ({}));
    const { text, amount, category, createdAt } = body ?? {};

    if (!text || amount === undefined) {
      return jsonError("Text and amount are required.", 400);
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return jsonError("Amount must be a valid number.", 400);
    }

    if (createdAt !== undefined && createdAt !== null && !isValidDate(createdAt)) {
      return jsonError("Date must be valid.", 400);
    }

    const transaction = await Transaction.create({
      text: String(text).trim(),
      amount: numericAmount,
      category: validCategory(category) ? category : "Other",
      user: user.id,
      ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
    });

    return NextResponse.json(
      {
        success: true,
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }

    console.error("Add transaction error:", error);
    return jsonError("Server error while creating transaction.");
  }
}
