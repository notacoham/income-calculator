import Button from "../../shared/Button";
import type { Category } from "../../../types/category";

export type SettingsModalProps = {
  open: boolean;
  draftCategories: Category[] | null;
  error?: string | null;
  // Mutators
  onClose: () => void; // discard and close
  onSave: () => void; // validate and save is handled by parent
  onAddCategory: () => void;
  onRemoveCategory: (index: number) => void;
  onLabelChange: (index: number, value: string) => void;
  onFractionChange: (index: number, value: number) => void;
};

export default function SettingsModal({
  open,
  draftCategories,
  error,
  onClose,
  onSave,
  onAddCategory,
  onRemoveCategory,
  onLabelChange,
  onFractionChange,
}: SettingsModalProps) {
  if (!open || !draftCategories) return null;

  const total = draftCategories.reduce(
    (sum, c) => sum + (Number(c.fraction) || 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-4 sm:p-6 shadow-xl ring-1 ring-black/5 dark:bg-slate-900 max-h-[80vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Settings
          </h2>
          <Button
            type="button"
            title="Add category"
            onClick={onAddCategory}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-900/40"
          >
            +
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Categories
            </h3>
            <div className="space-y-2">
              {draftCategories.map((cat, idx) => (
                <div key={cat.key} className="flex items-center gap-1 sm:gap-2">
                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) => onLabelChange(idx, e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-1 py-1 text-xs sm:px-2 sm:text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Values (fractions 0–1)
            </h3>
            <div className="space-y-2">
              {draftCategories.map((cat, idx) => (
                <div key={cat.key + "-val"} className="flex items-center gap-1 sm:gap-2">
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={Number.isFinite(cat.fraction) ? cat.fraction : 0}
                    onChange={(e) => {
                      const parsed = Number(e.target.value);
                      if (!isNaN(parsed)) {
                        const clamped = Math.max(0, Math.min(1, parsed));
                        onFractionChange(idx, clamped);
                      }
                    }}
                    className="w-full rounded-md border border-slate-300 bg-white px-1 py-1 text-xs sm:px-2 sm:text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <Button
                    type="button"
                    title="Remove category"
                    onClick={() => onRemoveCategory(idx)}
                    className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-red-300 bg-white text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-red-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-slate-700"
                  >
                    −
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Total and validation */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            Total fraction:{" "}
            <span className="font-semibold">{total.toFixed(2)}</span>
          </div>
          {error && (
            <div className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={onSave}
            className="mr-2 inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-900/40"
          >
            Save
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:focus:ring-slate-900/40"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
