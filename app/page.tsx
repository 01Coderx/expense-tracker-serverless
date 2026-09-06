import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold">
            ₹
          </div>

          <span className="text-2xl font-bold tracking-tight">
            Kharcha
          </span>
        </div>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Take control of your{" "}
          <span className="text-violet-400">money.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Track your income, expenses, budgets and financial goals
          in one simple personal-finance dashboard.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
          >
            Get started
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold transition hover:bg-slate-900"
          >
            View dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}