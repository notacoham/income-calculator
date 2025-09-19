import { useMemo, useState } from "react";

type Category = {
  key: string;
  label: string;
  fraction: number; // e.g., 0.34 for 34%
};

const CATEGORIES: Category[] = [
  { key: "rent", label: "Rent", fraction: 0.34 },
  { key: "gas", label: "Gas", fraction: 0.02 },
  { key: "subscriptions", label: "Subscriptions", fraction: 0.05 },
  { key: "food", label: "Food", fraction: 0.14 },
  { key: "fun", label: "Fun", fraction: 0.15 },
  { key: "school", label: "School", fraction: 0.1 },
  { key: "savings", label: "Savings", fraction: 0.2 },
];

function Calculator() {
  const [input, setInput] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }),
    []
  );

  const allocations = useMemo(() => {
    const amt = submittedAmount ?? 0;
    return CATEGORIES.map((c) => ({
      ...c,
      amount: amt * c.fraction,
    }));
  }, [submittedAmount]);

  function parseAdditionExpression(expr: string): number | null {
    // Allow numbers separated by '+' with optional whitespace, e.g., "1500 + 700 + 25.5"
    const parts = expr
      .split("+")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length === 0) return null;
    let sum = 0;
    for (const p of parts) {
      const n = Number(p);
      if (!isFinite(n)) return null;
      sum += n;
    }
    return sum;
  }

  function buildMarkdownTable(): string {
    if (submittedAmount === null) return "";
    const header = `| Category | Percent | Amount |\n| --- | --- | --- |`;
    const rows = allocations
      .map((r) => `| ${r.label} | (${r.fraction}) | ${currency.format(r.amount)} |`)
      .join("\n");
    const total = allocations.reduce((sum, r) => sum + r.amount, 0);
    const totalRow = `| Total | 100% | ${currency.format(total)} |`;
    const title = `Allocation based on paycheck ${currency.format(submittedAmount)}`;
    return `${title}\n\n${header}\n${rows}\n${totalRow}`;
  }

  async function onCopyTable() {
    try {
      const md = buildMarkdownTable();
      if (!md) return;
      await navigator.clipboard.writeText(md);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // First try to parse as simple addition expression with '+'
    const fromAddition = parseAdditionExpression(input);
    if (fromAddition !== null && fromAddition >= 0) {
      setSubmittedAmount(fromAddition);
    } else {
      // Fallback to plain number parse for robustness
      const val = Number(input);
      if (!isNaN(val) && isFinite(val) && val >= 0) {
        setSubmittedAmount(val);
      } else {
        setSubmittedAmount(null);
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Form Card */}
      <div className="rounded-xl bg-white/90 dark:bg-slate-900/70 backdrop-blur p-5 shadow-xl ring-1 ring-black/5">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label
            htmlFor="paycheck"
            className="text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Enter Paycheck Amount
          </label>
          <input
            id="paycheck"
            name="paycheck"
            type="text"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
            required
            placeholder="1500 + 300"
          />
          <button
            type="submit"
            className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-gray-500 shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-900/40"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Results Card - only visible after valid submission */}
      {submittedAmount !== null && (
        <div className="mt-6 rounded-xl bg-white/90 dark:bg-slate-900/70 backdrop-blur p-5 shadow-xl ring-1 ring-black/5">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Allocation
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Based on paycheck amount {currency.format(submittedAmount)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-700 dark:text-slate-300">
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold">Percent</th>
                  <th className="px-3 py-2 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((row) => (
                  <tr
                    key={row.key}
                    className="border-t border-slate-200/70 dark:border-slate-700/60"
                  >
                    <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                      {row.label}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                      ({row.fraction})
                    </td>
                    <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                      {currency.format(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-300/70 dark:border-slate-700/60">
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">
                    Total
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                    100%
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">
                    {currency.format(
                      allocations.reduce((sum, r) => sum + r.amount, 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onCopyTable}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:focus:ring-slate-900/40"
              title="Copy table for Notion"
            >
              {copied ? "Copied!" : "Copy table"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calculator;
