"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavigationItem } from "@/lib/types";

export function HeaderClient({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();
  // Avain pathname → komponentti remountataan reitin vaihtuessa ja
  // valikoiden tila nollautuu automaattisesti ilman setState-in-effect -hassua.
  return <HeaderClientInner key={pathname} items={items} pathname={pathname} />;
}

function HeaderClientInner({
  items,
  pathname,
}: {
  items: NavigationItem[];
  pathname: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Sulje desktop-dropdown kun klikataan ulkopuolelle
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!openDropdown) return;
    function onClick(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openDropdown]);

  // Sulje ESC-näppäimellä
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Päänavigaatio"
        className="hidden lg:flex items-center gap-1"
      >
        {items.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href + "/")) ||
            item.children?.some((c) => pathname.startsWith(c.href));
          if (hasChildren) {
            const isOpen = openDropdown === item.href;
            return (
              <div key={item.href} className="relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  onClick={() => setOpenDropdown(isOpen ? null : item.href)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition",
                    active ? "text-accent" : "text-foreground hover:text-accent",
                  )}
                >
                  {item.label}
                  <ChevronDown
                    aria-hidden
                    size={14}
                    className={cn("transition", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <div className="absolute left-0 top-full mt-1 min-w-56 rounded-2xl border border-border bg-background p-2 shadow-lg">
                    <Link
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-strong"
                    >
                      {item.label} — yleisesittely
                    </Link>
                    <div className="my-1 h-px bg-border" />
                    {item.children!.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-strong"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition",
                item.highlight
                  ? "bg-accent text-white hover:bg-accent-hover"
                  : active
                    ? "text-accent"
                    : "text-foreground hover:text-accent",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        aria-label={mobileOpen ? "Sulje valikko" : "Avaa valikko"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-strong lg:hidden"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-16 z-30 border-b border-border bg-background lg:hidden">
          <nav
            aria-label="Mobiilinavigaatio"
            className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4"
          >
            {items.map((item) => (
              <MobileItem key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

function MobileItem({
  item,
  pathname,
}: {
  item: NavigationItem;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={cn(
          "rounded-lg px-3 py-3 text-base font-medium transition",
          item.highlight
            ? "bg-accent text-center text-white"
            : active
              ? "text-accent"
              : "text-foreground hover:bg-surface-strong",
        )}
      >
        {item.label}
      </Link>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition",
          active ? "text-accent" : "text-foreground hover:bg-surface-strong",
        )}
      >
        <span>{item.label}</span>
        <ChevronDown
          aria-hidden
          size={16}
          className={cn("transition", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="ml-2 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
          <Link
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
          >
            Yleisesittely
          </Link>
          {item.children!.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-strong"
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
