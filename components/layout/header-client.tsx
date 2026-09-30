"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavigationItem } from "@/lib/types";

/**
 * Valikon avautuminen: 150 ms häivytys ja 4 px liuku ylhäältä. `starting:` on
 * CSS:n @starting-style, joten animaatio toimii ilman JavaScriptiä juuri
 * lisätylle elementille. Sulkeutuminen on välitön. Reduced motion poistaa
 * siirtymän (globals.css).
 */
const avautuu =
  "transition-[opacity,translate] duration-150 ease-out starting:-translate-y-1 starting:opacity-0";

/** Tailwindin lg-raja: tästä leveämmällä mobiilivalikkoa ei näytetä. */
const TYOPOYTA = "(min-width: 64rem)";

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
  // Esc palauttaa fokuksen avanneeseen painikkeeseen (WAI-ARIA disclosure):
  // muuten fokus katoaisi suljetun valikon linkin mukana.
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

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

  // Sulje Esc-näppäimellä ja palauta fokus avanneeseen painikkeeseen
  useEffect(() => {
    if (!openDropdown && !mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (openDropdown) {
        triggerRefs.current.get(openDropdown)?.focus();
        setOpenDropdown(null);
      }
      if (mobileOpen) {
        mobileButtonRef.current?.focus();
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openDropdown, mobileOpen]);

  // Mobiilivalikko auki: taustasivu ei vierity valikon alla (valikolla on oma
  // vieritys). Jos ikkuna levenee työpöytäkokoon, valikko suljetaan, jottei
  // piilotettu valikko jätä sivua lukkoon.
  useEffect(() => {
    if (!mobileOpen) return;
    const mql = window.matchMedia(TYOPOYTA);
    const aiempi = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const suljeLeveana = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mql.addEventListener("change", suljeLeveana);
    return () => {
      document.body.style.overflow = aiempi;
      mql.removeEventListener("change", suljeLeveana);
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Päänavigaatio"
        className="hidden lg:flex items-center gap-7 xl:gap-10"
      >
        {items.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href + "/")) ||
            item.children?.some((c) => pathname.startsWith(c.href));
          if (hasChildren) {
            const isOpen = openDropdown === item.href;
            const listaId = `alavalikko-${index}`;
            return (
              <div
                key={item.href}
                className="relative"
                // Tab valikosta ulos sulkee sen, jottei se jää sisällön päälle.
                onBlur={(e) => {
                  if (isOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setOpenDropdown(null);
                  }
                }}
              >
                {/* Disclosure-malli: ei aria-haspopupia, koska kyse on linkkilistasta eikä valikosta (role="menu"). */}
                <button
                  ref={(node) => {
                    if (node) triggerRefs.current.set(item.href, node);
                    else triggerRefs.current.delete(item.href);
                  }}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={listaId}
                  onClick={() => setOpenDropdown(isOpen ? null : item.href)}
                  className={cn(
                    "inline-flex items-center gap-1 py-1 text-base font-medium transition",
                    active
                      ? "text-accent shadow-[inset_0_-2px_0_var(--blue)]"
                      : "text-foreground hover:text-accent",
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
                  <div
                    id={listaId}
                    className={cn(
                      "absolute left-0 top-full mt-1 min-w-56 rounded-2xl border border-border bg-surface p-2 shadow-panel",
                      avautuu,
                    )}
                  >
                    {!hasOverviewChild(item) && (
                      <>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-strong"
                        >
                          {item.label} — yleisesittely
                        </Link>
                        <div className="my-1 h-px bg-border" />
                      </>
                    )}
                    {item.children!.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        aria-current={pathname === c.href ? "page" : undefined}
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
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                // Tyyliopas: ei CTA-painiketta, joten highlight-kohdetta ei korosteta.
                "py-1 text-base font-medium no-underline transition",
                active
                  ? "text-accent shadow-[inset_0_-2px_0_var(--blue)]"
                  : "text-foreground hover:text-accent",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        ref={mobileButtonRef}
        type="button"
        aria-label={mobileOpen ? "Sulje valikko" : "Avaa valikko"}
        aria-expanded={mobileOpen}
        aria-controls="mobiilivalikko"
        onClick={() => setMobileOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-navy hover:bg-surface-strong lg:hidden"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <>
          {/* Himmennys valikon alla: rajaa valikon sivusta, ja napautus sulkee
              sen. Ei fokusoitava: näppäimistöllä suljetaan Escillä tai
              valikkopainikkeella. */}
          <div
            aria-hidden
            onClick={() => setMobileOpen(false)}
            className="absolute inset-x-0 top-full z-20 h-dvh bg-navy/25 transition-opacity duration-200 starting:opacity-0 lg:hidden"
          />
          <div
            id="mobiilivalikko"
            className={cn(
              "absolute inset-x-0 top-full z-30 max-h-[calc(100dvh-var(--header-korkeus))] overflow-y-auto overscroll-contain",
              "border-b border-border bg-surface text-foreground shadow-panel lg:hidden",
              avautuu,
            )}
          >
            <nav
              aria-label="Mobiilinavigaatio"
              className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4"
            >
              {items.map((item) => (
                <MobileItem key={item.href} item={item} pathname={pathname} />
              ))}
            </nav>
          </div>
        </>
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
        aria-current={pathname === item.href ? "page" : undefined}
        className={cn(
          "rounded-lg px-3 py-3 text-base font-medium transition",
          active
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
        <div className={cn("ml-2 mt-1 flex flex-col gap-0.5 border-l border-border pl-3", avautuu)}>
          {!hasOverviewChild(item) && (
            <Link
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
            >
              Yleisesittely
            </Link>
          )}
          {item.children!.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              aria-current={pathname === c.href ? "page" : undefined}
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

/**
 * Jos jokin alakohde osoittaa jo pääkohteen sivulle (esim. Klubista → Esittely
 * /klubi), erillistä "yleisesittely"-linkkiä ei lisätä — se toistaisi saman.
 */
function hasOverviewChild(item: NavigationItem): boolean {
  return Boolean(item.children?.some((c) => c.href === item.href));
}
