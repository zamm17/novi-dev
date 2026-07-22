import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function PortalShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-primary">Novi</span>
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          </Link>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Demo
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 pb-16">
        {children}
        <footer className="mt-10 text-center text-xs text-muted-foreground">
          This is a prototype using fictional data. Novi supports the SLP — it does not make
          eligibility decisions.
        </footer>
      </main>
    </div>
  );
}

export function PortalCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {step}
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Required() {
  return <span className="text-rose-600" aria-label="required">*</span>;
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputCls} h-10 ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function CheckboxRow({
  label,
  name,
}: {
  label: string;
  name?: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent">
      <input type="checkbox" name={name} className="h-4 w-4 rounded border-input" />
      <span>{label}</span>
    </label>
  );
}

export function FrequencyRow({ label }: { label: string }) {
  const opts = ["Not a concern", "Sometimes", "Often", "Significant"] as const;
  const name = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
        {opts.map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-accent"
          >
            <input type="radio" name={name} className="h-3.5 w-3.5" />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}