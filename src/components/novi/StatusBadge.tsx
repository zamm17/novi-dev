import type { EvalStatus } from "@/lib/mock-data";
import { statusTone } from "@/lib/mock-data";

const toneClasses: Record<ReturnType<typeof statusTone>, string> = {
  ready: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  review: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  waiting: "bg-amber-100 text-amber-900 ring-amber-200",
  missing: "bg-rose-100 text-rose-800 ring-rose-200",
  intake: "bg-slate-100 text-slate-800 ring-slate-200",
};

export function StatusBadge({ status }: { status: EvalStatus }) {
  const tone = statusTone(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {status}
    </span>
  );
}