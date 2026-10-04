import { reviewErrorId, type ReviewField } from "./form-state";

/** Arvostelulomakkeen yhteiset tyylit ja pienet osat. */

export const fieldClass =
  "w-full rounded-sm border border-border-input bg-background px-3.5 py-2.5 text-base text-foreground " +
  "transition placeholder:text-muted-soft hover:border-muted-soft focus-visible:border-accent focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "aria-invalid:border-danger";

export const labelClass = "text-[15px] font-semibold text-foreground";

export function RequiredMark() {
  return (
    <span className="text-danger">
      {" *"}
      <span className="sr-only">pakollinen</span>
    </span>
  );
}

export function FieldMessages({ field, error }: { field: ReviewField; error?: string }) {
  if (!error) return null;
  return (
    <p id={reviewErrorId(field)} className="flex items-start gap-1.5 text-sm font-medium text-danger">
      <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0">
        <path
          fill="currentColor"
          d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 11.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-8a.9.9 0 0 0-.9.9v4.9a.9.9 0 0 0 1.8 0V6.4A.9.9 0 0 0 10 5.5Z"
        />
      </svg>
      {error}
    </p>
  );
}
