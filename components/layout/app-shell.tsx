"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheckIcon,
  CalendarCheckIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MenuIcon,
  SettingsIcon,
  SigmaIcon,
  TargetIcon,
  XIcon,
} from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon, hint: "Today at a glance" },
  { href: "/practice", label: "Practice Log", icon: ListChecksIcon, hint: "Every block you log" },
  { href: "/topics", label: "Topic Master", icon: BookOpenCheckIcon, hint: "Syllabus + mastery" },
  { href: "/sessions", label: "Session Log", icon: CalendarCheckIcon, hint: "Daily retros" },
  { href: "/formulas", label: "Formulas", icon: SigmaIcon, hint: "Shortcut sheet" },
  { href: "/settings", label: "Settings", icon: SettingsIcon, hint: "Goals + your data" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, hint }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                active ? "text-chart-1" : "text-muted-foreground",
              )}
            />
            <span className="min-w-0">
              <span className="block font-medium leading-tight">{label}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {hint}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-5 lg:flex">
        <Brand />
        <div className="mt-6 flex-1">{nav}</div>
        <div className="mb-3 flex items-center justify-between border-t border-sidebar-border px-3 pt-3">
          <span className="text-xs text-muted-foreground">Appearance</span>
          <ThemeToggle />
        </div>
        <p className="px-3 text-xs leading-relaxed text-muted-foreground">
          Data lives in this browser only. Back it up from{" "}
          <Link href="/settings" className="underline underline-offset-2">
            Settings
          </Link>
          .
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </Button>
          <Brand compact />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {open ? (
          <div className="border-b border-border bg-sidebar px-3 py-3 lg:hidden">{nav}</div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-chart-1 text-white">
        <TargetIcon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight tracking-tight">
          Exam Training
        </span>
        {!compact ? (
          <span className="block text-xs text-muted-foreground">
            Banking + Railway tracker
          </span>
        ) : null}
      </span>
    </Link>
  );
}
