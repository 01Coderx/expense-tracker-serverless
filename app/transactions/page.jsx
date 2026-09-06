"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { apiFetch } from "../../lib/api";
import Link from "next/link";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");  

  const [category, setCategory] = useState("Other");

  const [showAddForm, setShowAddForm] = useState(false);

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [editingTransaction, setEditingTransaction] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/transactions");

      setTransactions(response.data || []);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);


  // food section

  const categories = [
  { value: "Food", icon: "🍔" },
  { value: "Groceries", icon: "🛒" },
  { value: "Transport", icon: "🚗" },
  { value: "Bills", icon: "🏠" },
  { value: "Shopping", icon: "🛍️" },
  { value: "Health", icon: "💊" },
  { value: "Finance", icon: "💳" },
  { value: "Salary", icon: "💰" },
  { value: "Other", icon: "📦" },
];
  // -----------------------------
  // Filter transactions
  // -----------------------------

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = transaction.text
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "income" && transaction.amount > 0) ||
        (filter === "expense" && transaction.amount < 0);

      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  // -----------------------------
  // Add transaction
  // -----------------------------
  

  const getDateInputValue = (dateString) => {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTimeInputValue = (dateString) => {
  const date = new Date(dateString);

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${hours}:${minutes}`;
};

  const handleEdit = (transaction) => {
  setEditingTransaction(transaction);

  setText(transaction.text);

  setAmount(
    Math.abs(transaction.amount).toString()
  );

  setType(
    transaction.amount >= 0
      ? "income"
      : "expense"
  );

  setCategory(transaction.category || "Other");

  setDate(
    getDateInputValue(transaction.createdAt)
  );

  setTime(
    getTimeInputValue(transaction.createdAt)
  );

  setError("");
  setShowAddForm(true);
};

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (!text.trim() || !amount || !date || !time) {
    setError(
      "Please enter description, amount, date and time."
    );
    return;
  }

  try {
    setSaving(true);
    setError("");

    const numericAmount = Number(amount);

    const finalAmount =
      type === "income"
        ? Math.abs(numericAmount)
        : -Math.abs(numericAmount);

    const createdAt = new Date(
      `${date}T${time}`
    ).toISOString();

    if (editingTransaction) {
      // -----------------------------
      // UPDATE
      // -----------------------------

      const response = await apiFetch(
        `/transactions/${editingTransaction._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
  text: text.trim(),
  amount: finalAmount,
  category,
  createdAt,
}),
        }
      );

      setTransactions((current) =>
        current.map((transaction) =>
          transaction._id === editingTransaction._id
            ? response.data
            : transaction
        )
      );
    } else {
      // -----------------------------
      // CREATE
      // -----------------------------

      const response = await apiFetch(
        "/transactions",
        {
          method: "POST",
          body: JSON.stringify({
            text: text.trim(),
            amount: finalAmount,
            category,
            createdAt,
          }),
        }
      );

      setTransactions((current) => [
        response.data,
        ...current,
      ]);
    }

    // Reset form
    setText("");
    setAmount("");
    setDate("");
    setTime("");
    setType("expense");
    setCategory("Other");
    setEditingTransaction(null);
    setShowAddForm(false);
  } catch (error) {
    console.error(error);

    setError(
      error.message ||
        "Failed to save transaction."
    );
  } finally {
    setSaving(false);
  }
};

  // -----------------------------
  // Delete transaction
  // -----------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/transactions/${id}`, {
        method: "DELETE",
      });

      setTransactions((current) =>
        current.filter(
          (transaction) => transaction._id !== id
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Failed to delete transaction."
      );
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <Link
      href="/dashboard"
      className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
    >
      ← Back to Dashboard
    </Link>

    <h1 className="text-3xl font-bold">
      Transactions
    </h1>

    <p className="mt-1 text-slate-400">
      Manage your income and expenses.
    </p>
  </div>

  <button
    onClick={() => {
  setEditingTransaction(null);
  setText("");
  setAmount("");
  setType("expense");
  setCategory("Other");

  const now = new Date();

  setDate(
    `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`
  );

  setTime(
    `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`
  );

  setError("");
  setShowAddForm(true);
}}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium transition hover:bg-violet-500"
  >
    <Plus size={19} />
    Add Transaction
  </button>
</div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Search + filters */}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-500"
              />
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1">
              {[
                ["all", "All"],
                ["income", "Income"],
                ["expense", "Expenses"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === value
                      ? "bg-violet-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction list */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Your Transactions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredTransactions.length} transaction
                    {filteredTransactions.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-xl bg-slate-800"
                  />
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
                  <Search
                    size={22}
                    className="text-slate-500"
                  />
                </div>

                <h3 className="mt-4 font-semibold">
                  No transactions found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filter.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredTransactions.map((transaction) => {
                  const isIncome = transaction.amount > 0;

                  return (
                    <div
                      key={transaction._id}
                      className="group flex items-center justify-between px-4 py-4 transition hover:bg-slate-800/40 sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isIncome
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight size={20} />
                          ) : (
                            <ArrowDownLeft size={20} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {transaction.text}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
  <span>
    {new Date(
      transaction.createdAt
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}
  </span>

  <span>•</span>

  <span>
    {transaction.category || "Other"}
  </span>
</div>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center gap-3">
                        <span
                          className={`whitespace-nowrap font-semibold ${
                            isIncome
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(
                            Math.abs(transaction.amount)
                          )}
                        </span>

<button
  onClick={() => handleEdit(transaction)}
  className="rounded-lg p-2 text-slate-600 transition hover:bg-violet-500/10 hover:text-violet-400"
  title="Edit transaction"
>
  <Edit size={18} />
</button>

                        <button
                          onClick={() =>
                            handleDelete(transaction._id)
                          }
                          className="rounded-lg p-2 text-slate-600 opacity-100 transition hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Delete transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Add transaction modal */}
      {showAddForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

      {/* Modal Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {editingTransaction
              ? "Edit Transaction"
              : "Add Transaction"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {editingTransaction
              ? "Update your transaction details."
              : "Record your income or expense."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm(false);
            setEditingTransaction(null);
            setError("");
          }}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Form */}
      <form
        onSubmit={handleSubmit}
        className="min-h-0 flex-1 overflow-y-auto p-6"
      >
        <div className="space-y-5">

          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Type
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  type === "expense"
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                Expense
              </button>

              <button
                type="button"
                onClick={() => setType("income")}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  type === "income"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="transaction-text"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <input
              id="transaction-text"
              type="text"
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              placeholder="e.g. Grocery shopping"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          {/* Category */}
          {/* Category */}
<div>
  <label
    htmlFor="transaction-category"
    className="mb-2 block text-sm font-medium text-slate-700"
  >
    Category
  </label>

  <select
    id="transaction-category"
    value={category}
    onChange={(event) => setCategory(event.target.value)}
    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
  >
    {categories.map((item) => (
      <option
        key={item.value}
        value={item.value}
      >
        {item.icon} {item.value}
      </option>
    ))}
  </select>
</div>
          
          {/* Amount */}
          <div>
            <label
              htmlFor="transaction-amount"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ₹
              </span>

              <input
                id="transaction-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="transaction-date"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Date
            </label>

            <input
              id="transaction-date"
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          {/* Time */}
          <div>
            <label
              htmlFor="transaction-time"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Time
            </label>

            <input
              id="transaction-time"
              type="time"
              value={time}
              onChange={(event) =>
                setTime(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingTransaction
              ? "Save Changes"
              : "Add Transaction"}
          </button>

        </div>
      </form>
    </div>
  </div>
)}
      </main>
    </ProtectedRoute>
  );
}
