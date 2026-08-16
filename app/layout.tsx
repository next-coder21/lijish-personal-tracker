import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import {
  DEFAULT_PALETTE,
  PALETTE_CLASSES,
  PALETTE_IDS,
} from "@/lib/palettes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Training Tracker",
  description:
    "Daily performance dashboard for Banking + Railway competitive-exam preparation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* `value` maps each theme id to the class string written onto <html>.
            Deep Focus Dark carries `dark` as well so Tailwind's `dark:`
            variants — which the shadcn components rely on — still apply. */}
        <ThemeProvider
          attribute="class"
          defaultTheme={DEFAULT_PALETTE}
          themes={PALETTE_IDS}
          value={PALETTE_CLASSES}
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
