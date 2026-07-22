import { Link, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { ClipboardList, Users, FileInput, FileText, Settings, Search, Waves } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Evaluations", icon: ClipboardList, real: true },
  { to: "/students", label: "Students", icon: Users, real: false },
  { to: "/intake-forms", label: "Intake Forms", icon: FileInput, real: false },
  { to: "/drafts", label: "Drafts", icon: FileText, real: false },
  { to: "/settings", label: "Settings", icon: Settings, real: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Waves className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Novi</span>
          <span className="ml-2 hidden text-xs text-muted-foreground md:inline">
            Evaluation workspace for school SLPs
          </span>
        </Link>
        <div className="ml-4 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search students or evaluations…"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Demo prototype · fictional data
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-medium">
            RS
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
          <nav className="flex flex-col gap-0.5 p-3">
            {nav.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/" || pathname.startsWith("/evaluations")
                  : false;
              const Icon = item.icon;
              const cls = `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-left transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
              }`;
              if (item.real) {
                return (
                  <Link key={item.to} to={item.to} className={cls}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              }
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => toast(`${item.label} — coming soon in this prototype.`)}
                  className={cls}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto p-3 text-[11px] leading-relaxed text-muted-foreground">
            Novi supports clinical decision-making. It does not make eligibility decisions.
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}