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
      <p className="mt-4 text-base leading-relaxed text-foreground first:mt-0">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 font-serif text-3xl leading-tight">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 font-serif text-2xl leading-tight">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 font-serif text-xl leading-tight">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-4 border-brand-300 bg-surface px-5 py-3 italic text-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-1 pl-6 text-foreground">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-1 pl-6 text-foreground">{children}</ol>
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
            className="text-accent underline-offset-4 hover:underline"
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className="text-accent underline-offset-4 hover:underline">
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
          <SanityImage
            image={value}
            width={1200}
            height={800}
            sizes="(min-width: 768px) 720px, 100vw"
            className="rounded-xl"
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
