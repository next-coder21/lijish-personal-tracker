"use client";

import { useTheme } from "next-themes";
import { CheckIcon, PaletteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PALETTES } from "@/lib/palettes";
import { cn } from "@/lib/utils";

/**
 * The only appearance control. There is no separate light/dark switch — one of
 * the five themes is the dark one, so choosing a palette chooses the mode too.
 */
export function PalettePicker({ align = "end" }: { align?: "start" | "end" }) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Change theme">
            <PaletteIcon className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align={align} className="w-64">
        {/* Base UI requires a group around the label — a bare GroupLabel throws. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PALETTES.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onClick={() => setTheme(p.id)}
              className="items-start gap-2.5 py-2"
            >
              <Swatch colors={p.swatch} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-tight">
                  {p.name}
                </span>
                <span className="block text-xs leading-snug text-muted-foreground">
                  {p.blurb}
                </span>
              </span>
              <CheckIcon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  theme === p.id ? "opacity-100" : "opacity-0",
                )}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Background, surface, primary and accent, so each theme is recognisable. */
function Swatch({ colors }: { colors: readonly string[] }) {
  return (
    <span
      aria-hidden
      className="mt-0.5 flex size-6 shrink-0 flex-wrap overflow-hidden rounded-md ring-1 ring-border"
    >
      {colors.map((c, i) => (
        <span key={i} className="size-3" style={{ background: c }} />
      ))}
    </span>
  );
}
