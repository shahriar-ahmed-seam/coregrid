"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Modules", href: "#modules" },
  { label: "Private AI", href: "#ai" },
  { label: "Features", href: "#features" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-[#07080c]/80 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/30">
            <LayoutGrid className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            CoreGrid
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-300 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            variant="ghost"
            className="text-zinc-200 hover:bg-white/10 hover:text-white"
          >
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button
            asChild
            className="bg-white text-zinc-900 hover:bg-zinc-200"
          >
            <Link href="/dashboard">Launch app</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-lg text-zinc-200 hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#07080c]/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild className="bg-white text-zinc-900 hover:bg-zinc-200">
                <Link href="/dashboard">Launch app</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
