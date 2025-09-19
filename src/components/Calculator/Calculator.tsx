import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Button from "../shared/Button";
import SettingsModal from "./SettingsModal/SettingsModal";
import type { Category } from "../../types/category";

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [draftCategories, setDraftCategories] = useState<Category[] | null>(
    null
  );
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Persist categories to localStorage and hydrate on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("income-calculator.categories");
      if (raw) {
        const parsed: Category[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Basic shape validation
          const valid = parsed.every(
            (c) =>
              typeof c?.key === "string" &&
              typeof c?.label === "string" &&
              typeof c?.fraction === "number"
          );
          if (valid) {
            setCategories(parsed);
          }
        }
      }
    } catch (e) {
      // ignore corrupt storage
      console.warn("Failed to load categories from localStorage", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "income-calculator.categories",
        JSON.stringify(categories)
      );
    } catch (e) {
      console.warn("Failed to save categories to localStorage", e);
    }
  }, [categories]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }),
    []
  );

  const allocations = useMemo(() => {
    const amt = submittedAmount ?? 0;
    return categories.map((c) => ({
      ...c,
      amount: amt * c.fraction,
    }));
  }, [submittedAmount, categories]);

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
      .map(
        (r) => `| ${r.label} | (${r.fraction}) | ${currency.format(r.amount)} |`
      )
      .join("\n");
    const total = allocations.reduce((sum, r) => sum + r.amount, 0);
    const totalRow = `| Total | 100% | ${currency.format(total)} |`;
    const title = `Allocation based on paycheck ${currency.format(
      submittedAmount
    )}`;
    return `${title}\n\n${header}\n${rows}\n${totalRow}`;
  }

  async function onCopyTable() {
    try {
      const md = buildMarkdownTable();
      if (!md) return;
      await navigator.clipboard.writeText(md);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      toast.success("Copied table to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy table");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // First try to parse as simple addition expression with '+'
    const fromAddition = parseAdditionExpression(input);
    if (fromAddition !== null && fromAddition >= 0) {
      setSubmittedAmount(fromAddition);
      toast.success("Submitted amount updated");
    } else {
      // Fallback to plain number parse for robustness
      const val = Number(input);
      if (!isNaN(val) && isFinite(val) && val >= 0) {
        setSubmittedAmount(val);
        toast.success("Submitted amount updated");
      } else {
        setSubmittedAmount(null);
        toast.error("Please enter a valid number or addition expression");
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Form Card */}
      <div className="rounded-xl bg-white dark:bg-brand-4/60 backdrop-blur p-5 shadow-xl ring-1 ring-black/5">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label
            htmlFor="paycheck"
            className="text-sm font-semibold text-brand-4 dark:text-brand-2"
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
            className="w-full rounded-lg border border-brand-2/60 bg-white px-3 py-2 text-brand-4 placeholder-brand-3/50 shadow-sm outline-none focus:border-brand-3 focus:ring-4 focus:ring-brand-3/30 dark:border-brand-4/50 dark:bg-brand-4/30 dark:text-brand-1 dark:placeholder-brand-1/80 dark:focus:border-brand-2 dark:focus:ring-brand-4/40"
            required
            placeholder="1500 + 300"
          />
          <Button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-lg border bg-brand-4 px-4 py-2 text-sm font-semibold text-brand-1 shadow-sm hover:bg-brand-4/80 focus:outline-none focus:ring-4 focus:ring-brand-4/40"
          >
            Submit
          </Button>
          <Button
            type="button"
            onClick={() => {
              setDraftCategories(categories.map((c) => ({ ...c })));
              setSettingsError(null);
              setSettingsOpen(true);
            }}
            className="mt-2 inline-flex items-center justify-center rounded-lg border border-brand-2 bg-brand-2 px-4 py-2 text-sm font-semibold text-brand-4 shadow-sm transition hover:bg-brand-2/40 focus:outline-none focus:ring-4 focus:ring-brand-3/40 dark:border-brand-4/60 dark:bg-brand-4/30 dark:text-brand-1 dark:hover:bg-brand-4/40 dark:focus:ring-brand-4/40"
          >
            Settings
          </Button>
        </form>
      </div>

      {/* Results Card - only visible after valid submission */}
      {submittedAmount !== null && (
        <div className="mt-6 rounded-xl bg-white/90 dark:bg-brand-4/60 backdrop-blur p-5 shadow-xl ring-1 ring-black/5">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-brand-4 dark:text-brand-2">
              Allocation
            </h2>
            <p className="text-sm text-brand-3/90 dark:text-brand-2/90">
              Based on paycheck amount {currency.format(submittedAmount)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-brand-4 dark:text-brand-2">
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold">Percent</th>
                  <th className="px-3 py-2 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((row) => (
                  <tr
                    key={row.key}
                    className="border-t border-brand-2/60 dark:border-brand-4/40"
                  >
                    <td className="px-3 py-2 text-brand-4 dark:text-brand-2">
                      {row.label}
                    </td>
                    <td className="px-3 py-2 text-brand-3/90 dark:text-brand-2/90">
                      ({row.fraction})
                    </td>
                    <td className="px-3 py-2 text-brand-4 dark:text-brand-2">
                      {currency.format(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-brand-2/60 dark:border-brand-4/40">
                  <td className="px-3 py-2 font-semibold text-brand-4 dark:text-brand-2">
                    Total
                  </td>
                  <td className="px-3 py-2 text-brand-3/90 dark:text-brand-2/90">
                    100%
                  </td>
                  <td className="px-3 py-2 font-semibold text-brand-4 dark:text-brand-2">
                    {currency.format(
                      allocations.reduce((sum, r) => sum + r.amount, 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={onCopyTable}
              className="inline-flex items-center gap-1 rounded-md border border-brand-2 bg-brand-1 px-3 py-1.5 text-xs font-medium text-brand-4 shadow-sm transition hover:bg-brand-2/40 focus:outline-none focus:ring-4 focus:ring-brand-2/40 dark:border-brand-4/60 dark:bg-brand-4/30 dark:text-brand-1 dark:hover:bg-brand-4/40 dark:focus:ring-brand-4/40"
              title="Copy table for Notion"
            >
              {copied ? "Copied!" : "Copy table"}
            </Button>
          </div>
        </div>
      )}
      {settingsOpen && (
        <SettingsModal
          open={settingsOpen}
          draftCategories={draftCategories}
          error={settingsError}
          onClose={() => {
            // Discard changes
            setDraftCategories(null);
            setSettingsError(null);
            setSettingsOpen(false);
          }}
          onSave={() => {
            if (!draftCategories) return;
            // Save and validate total equals 1.0
            const total = draftCategories.reduce(
              (sum, c) => sum + (Number(c.fraction) || 0),
              0
            );
            const epsilon = 0.000001;
            if (Math.abs(total - 1.0) > epsilon) {
              setSettingsError("Fractions must sum to exactly 1.00");
              toast.error("Fractions must sum to exactly 1.00");
              return;
            }
            setCategories(draftCategories);
            setDraftCategories(null);
            setSettingsError(null);
            setSettingsOpen(false);
            toast.success("Settings saved");
          }}
          onAddCategory={() => {
            const newCat: Category = {
              key: `new-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 6)}`,
              label: "New Category",
              fraction: 0,
            };
            setDraftCategories([...(draftCategories || []), newCat]);
          }}
          onRemoveCategory={(idx) => {
            if (!draftCategories) return;
            const next = draftCategories.filter((_, i) => i !== idx);
            setDraftCategories(next);
          }}
          onLabelChange={(idx, value) => {
            if (!draftCategories) return;
            const next = [...draftCategories];
            next[idx] = { ...next[idx], label: value };
            setDraftCategories(next);
          }}
          onFractionChange={(idx, value) => {
            if (!draftCategories) return;
            const clamped = Math.max(0, Math.min(1, value));
            const next = [...draftCategories];
            next[idx] = { ...next[idx], fraction: clamped };
            setDraftCategories(next);
          }}
        />
      )}
    </div>
  );
}

export default Calculator;
