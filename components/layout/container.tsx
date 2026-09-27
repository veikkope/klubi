import { cn } from "@/lib/cn";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "narrow" | "default" | "wide";
  as?: "div" | "section" | "article" | "header" | "footer" | "main";
};

// Tyyliopas (Sivut v3): leveä taitto 1440 px, sisältö 80 px:n sivumarginaalilla
// tietokoneella ja 20 px mobiilissa. Kapeammat koot tekstisivuille.
const sizeClass: Record<NonNullable<ContainerProps["size"]>, string> = {
  narrow: "max-w-3xl px-5 sm:px-6",
  default: "max-w-5xl px-5 sm:px-6",
  wide: "max-w-[1440px] px-5 sm:px-10 xl:px-20",
};

export function Container({
  size = "default",
  as: Tag = "div",
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full", sizeClass[size], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
