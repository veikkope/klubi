import {
  PortableText as PortableTextRaw,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import Link from "next/link";
import { SanityImage } from "./sanity-image";
import type { SanityImage as SanityImageData } from "@/lib/types";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-4 text-lg leading-relaxed text-foreground first:mt-0">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 font-display text-3xl leading-tight">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 font-display text-2xl leading-tight">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 font-display text-xl leading-tight">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-navy bg-surface px-5 py-3 text-lg italic text-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-1 pl-6 text-lg text-foreground marker:text-muted-soft">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-1 pl-6 text-lg text-foreground marker:text-muted">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    link: ({ value, children }) => {
      const href: string = value?.href ?? "#";
      const newTab = Boolean(value?.newTab);
      if (newTab || /^https?:/.test(href)) {
        return (
          <a
            href={href}
            target={newTab ? "_blank" : undefined}
            rel={newTab ? "noopener noreferrer" : undefined}
            className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2">
          {children}
        </Link>
      );
    },
  },
  types: {
    imageWithAlt: ({ value }: { value: SanityImageData }) => {
      if (!value) return null;
      return (
        <figure className="mt-8">
          {/* Rajaamaton: migroidussa sisällössä on kaavioita ja otteluohjelmia,
              joista 3:2-rajaus leikkaisi tietoa pois. */}
          <SanityImage
            image={value}
            width={1200}
            crop={false}
            sizes="(min-width: 768px) 720px, 100vw"
            className="h-auto max-w-full rounded-xl"
          />
          {value.caption && (
            <figcaption className="mt-2 text-sm text-muted">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export function PortableText({ value }: { value: PortableTextBlock[] | null | undefined }) {
  if (!value || value.length === 0) return null;
  return <PortableTextRaw value={value} components={components} />;
}
