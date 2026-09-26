/**
 * Klubi-osion yhtenäinen tyhjätila.
 *
 * Sanity-projektia ei ole vielä luotu, joten jokainen kysely palauttaa
 * fallbackin. Sivu ei saa näyttää rikkinäiseltä eikä teeskennellä sisältöä:
 * kerrotaan suoraan, että teksti lisätään Studiossa.
 */

export function EmptyState({
  title = "Sisältöä ei ole vielä lisätty",
  description = "Sisältöä ei ole vielä lisätty Studiossa.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-10">
      <p className="font-serif text-2xl text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
