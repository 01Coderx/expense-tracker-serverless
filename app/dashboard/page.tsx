"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Receipt,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import ProtectedRoute from "../../components/ProtectedRoute";
import { apiFetch } from "../../lib/api";

/* =========================================================
   TYPES
========================================================= */

type Category =
  | "Food"
  | "Groceries"
  | "Transport"
  | "Bills"
  | "Shopping"
  | "Health"
  | "Finance"
  | "Salary"
  | "Other";

type Transaction = {
  _id: string;
  text: string;
  amount: number;
  category?: string;
  createdAt?: string;
};

type Stats = {
  income: number;
  expenses: number;
  balance: number;
};

type ApiResponse = {
  success: boolean;
  count?: number;
  data?: Transaction[];
  message?: string;
};

type MiniStatProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
  valueClass: string;
  isNumber?: boolean;
};

type TransactionRowProps = {
  transaction: Transaction;
  category: string;
  isIncome: boolean;
  formatCurrency: (value: number) => string;
};

/* =========================================================
   CATEGORY ICONS
========================================================= */

const categoryIcons: Record<Category, string> = {
  Food: "🍔",
  Groceries: "🛒",
  Transport: "🚗",
  Bills: "🏠",
  Shopping: "🛍️",
  Health: "💊",
  Finance: "💳",
  Salary: "💰",
  Other: "📦",
};

/* =========================================================
   CATEGORY HELPER
========================================================= */

function getCategoryIcon(category: string): string {
  if (category in categoryIcons) {
    return categoryIcons[category as Category];
  }

  return categoryIcons.Other;
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  /* =======================================================
     LOAD TRANSACTIONS
  ======================================================= */

  useEffect(() => {
    const loadTransactions = async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const response = (await apiFetch(
          "/transactions"
        )) as ApiResponse;

        setTransactions(response.data || []);
      } catch (error: unknown) {
        console.error(error);

        if (error instanceof Error) {
          setError(
            error.message || "Failed to load dashboard."
          );
        } else {
          setError("Failed to load dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  /* =======================================================
     CALCULATE STATS
  ======================================================= */

  const stats: Stats = useMemo(() => {
    let income = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount) || 0;

      if (amount > 0) {
        income += amount;
      } else {
        expenses += Math.abs(amount);
      }
    });

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  /* =======================================================
     CATEGORY EXPENSES
  ======================================================= */

  const categoryExpenses: [string, number][] = useMemo(() => {
    const categories: Record<string, number> = {};

    transactions
      .filter(
        (transaction) => Number(transaction.amount) < 0
      )
      .forEach((transaction) => {
        const category =
          transaction.category?.trim() || "Other";

        const amount =
          Math.abs(Number(transaction.amount)) || 0;

        categories[category] =
          (categories[category] || 0) + amount;
      });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [transactions]);

  /* =======================================================
     RECENT TRANSACTIONS
  ======================================================= */

  const recentTransactions: Transaction[] =
    transactions.slice(0, 6);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#080b12] text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles
                  size={16}
                  className="text-violet-400"
                />

                <span className="text-sm font-medium text-violet-400">
                  Personal Finance
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Keep track of your money, expenses and income.
              </p>
            </div>

            <Link
              href="/transactions"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 active:scale-[0.98]"
            >
              <Plus size={18} />
              Add Transaction
            </Link>

          </header>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* =================================================
                  BALANCE HERO
              ================================================= */}

              <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-violet-950/80 via-slate-900 to-slate-900 p-6 shadow-2xl shadow-black/20 sm:p-8">

                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

                <div className="relative">

                  <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">

                    <div>

                      <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                        <Wallet size={17} />
                        Total Balance
                      </div>

                      <p
                        className={`text-4xl font-bold tracking-tight sm:text-5xl ${
                          stats.balance < 0
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {formatCurrency(stats.balance)}
                      </p>

                      <p className="mt-3 text-sm text-slate-500">
                        Your current balance based on all transactions.
                      </p>

                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">

                      {/* Income */}

                      <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/10 px-4 py-3">

                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                          <ArrowUpRight size={15} />
                          Income
                        </div>

                        <p className="mt-1 font-semibold text-emerald-300">
                          {formatCurrency(stats.income)}
                        </p>

                      </div>

                      {/* Expenses */}

                      <div className="rounded-xl border border-red-500/10 bg-red-500/10 px-4 py-3">

                        <div className="flex items-center gap-2 text-xs text-red-400">
                          <ArrowDownLeft size={15} />
                          Expenses
                        </div>

                        <p className="mt-1 font-semibold text-red-300">
                          {formatCurrency(stats.expenses)}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
                  STATS
              ================================================= */}

              <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <MiniStat
                  title="Income"
                  value={stats.income}
                  icon={<TrendingUp size={18} />}
                  iconClass="bg-emerald-500/10 text-emerald-400"
                  valueClass="text-emerald-400"
                />

                <MiniStat
                  title="Expenses"
                  value={stats.expenses}
                  icon={<TrendingDown size={18} />}
                  iconClass="bg-red-500/10 text-red-400"
                  valueClass="text-red-400"
                />

                <MiniStat
                  title="Transactions"
                  value={transactions.length}
                  icon={<Receipt size={18} />}
                  iconClass="bg-violet-500/10 text-violet-400"
                  valueClass="text-white"
                  isNumber
                />

              </section>

              {/* =================================================
                  MAIN CONTENT
              ================================================= */}

              <section className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">

                {/* =================================================
                    RECENT TRANSACTIONS
                ================================================= */}

                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">

                  <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6">

                    <div>
                      <h2 className="font-semibold">
                        Recent Transactions
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Your latest financial activity
                      </p>
                    </div>

                    <Link
                      href="/transactions"
                      className="group flex items-center gap-1 text-sm font-medium text-violet-400 transition hover:text-violet-300"
                    >
                      View all

                      <ChevronRight
                        size={16}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </Link>

                  </div>

                  {recentTransactions.length === 0 ? (
                    <EmptyTransactions />
                  ) : (
                    <div className="divide-y divide-slate-800/80">

                      {recentTransactions.map(
                        (transaction) => {

                          const amount =
                            Number(transaction.amount) || 0;

                          const isIncome =
                            amount > 0;

                          const category =
                            transaction.category?.trim() ||
                            "Other";

                          return (
                            <TransactionRow
                              key={transaction._id}
                              transaction={transaction}
                              category={category}
                              isIncome={isIncome}
                              formatCurrency={
                                formatCurrency
                              }
                            />
                          );
                        }
                      )}

                    </div>
                  )}

                </div>

                {/* =================================================
                    SPENDING BY CATEGORY
                ================================================= */}

                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">

                  <div className="border-b border-slate-800 px-5 py-5 sm:px-6">

                    <h2 className="font-semibold">
                      Spending
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Your biggest expense categories
                    </p>

                  </div>

                  {categoryExpenses.length === 0 ? (
                    <div className="flex min-h-[280px] items-center justify-center px-6 text-center text-sm text-slate-500">
                      No expense data available yet.
                    </div>
                  ) : (
                    <div className="space-y-6 p-5 sm:p-6">

                      {categoryExpenses.map(
                        ([category, amount]) => {

                          const percentage =
                            stats.expenses > 0
                              ? (amount /
                                  stats.expenses) *
                                100
                              : 0;

                          return (
                            <div key={category}>

                              <div className="mb-2 flex items-center justify-between">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-base">
                                    {getCategoryIcon(
                                      category
                                    )}
                                  </div>

                                  <div>

                                    <p className="text-sm font-medium">
                                      {category}
                                    </p>

                                    <p className="text-xs text-slate-600">
                                      {percentage.toFixed(
                                        1
                                      )}
                                      %
                                    </p>

                                  </div>

                                </div>

                                <p className="text-sm font-semibold">
                                  {formatCurrency(amount)}
                                </p>

                              </div>

                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

                                <div
                                  className="h-full rounded-full bg-violet-500 transition-all duration-500"
                                  style={{
                                    width: `${Math.min(
                                      percentage,
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>

              </section>
            </>
          )}

        </div>
      </main>
    </ProtectedRoute>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  title,
  value,
  icon,
  iconClass,
  valueClass,
  isNumber = false,
}: MiniStatProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700">

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-500">
          {title}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      <p
        className={`mt-4 text-2xl font-bold tracking-tight ${valueClass}`}
      >
        {isNumber
          ? value
          : new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(value)}
      </p>

    </div>
  );
}

/* =========================================================
   TRANSACTION ROW
========================================================= */

function TransactionRow({
  transaction,
  category,
  isIncome,
  formatCurrency,
}: TransactionRowProps) {
  const amount = Number(transaction.amount) || 0;

  let formattedDate = "";

  if (transaction.createdAt) {
    const parsedDate = new Date(
      transaction.createdAt
    );

    if (!Number.isNaN(parsedDate.getTime())) {
      formattedDate = parsedDate.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
        }
      );
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-800/30 sm:px-6">

      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isIncome
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {isIncome ? (
            <ArrowUpRight size={18} />
          ) : (
            <ArrowDownLeft size={18} />
          )}
        </div>

        <div className="min-w-0">

          <p className="truncate text-sm font-medium text-slate-200">
            {transaction.text}
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">

            <span>
              {getCategoryIcon(category)}
            </span>

            <span>{category}</span>

            {formattedDate && (
              <>
                <span>•</span>
                <span>{formattedDate}</span>
              </>
            )}

          </div>

        </div>

      </div>

      <p
        className={`ml-4 whitespace-nowrap text-sm font-semibold ${
          isIncome
            ? "text-emerald-400"
            : "text-red-400"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(Math.abs(amount))}
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY TRANSACTIONS
========================================================= */

function EmptyTransactions() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
        <Receipt
          size={24}
          className="text-slate-500"
        />
      </div>

      <h3 className="mt-4 font-semibold">
        No transactions yet
      </h3>

      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Start tracking your money by adding your first transaction.
      </p>

      <Link
        href="/transactions"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium transition hover:bg-violet-500"
      >
        <Plus size={16} />
        Add Transaction
      </Link>

    </div>
  );
}

/* =========================================================
   DASHBOARD SKELETON
========================================================= */

function DashboardSkeleton() {
  return (
    <div className="space-y-5">

      <div className="h-64 animate-pulse rounded-3xl bg-slate-900" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl bg-slate-900"
          />
        ))}

      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">

        <div className="h-[500px] animate-pulse rounded-3xl bg-slate-900" />

        <div className="h-[500px] animate-pulse rounded-3xl bg-slate-900" />

      </div>

    </div>
  );
}
