/**
 * Klubi-osion yhtenäinen tyhjätila.
 *
 * Näytetään, kun sisältöä (hallitus, säännöt, yhteystiedot) ei ole vielä
 * täytetty Studiossa. Sivu ei saa näyttää rikkinäiseltä eikä teeskennellä
 * sisältöä. Teksti on kirjoitettu kävijälle — ohjeet editorille ovat
 * docs/09-editor-guide.md:n "Täytä itse" -osiossa, eivät julkisella sivulla.
 *
 * `data-empty-state` antaa tarkistusskripteille (verify-redirects) luotettavan
 * tunnisteen tekstin sanamuodosta riippumatta.
 */

export function EmptyState({
  title = "Sisältöä ei ole vielä lisätty",
  description = "Tätä osiota täydennetään parhaillaan.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      data-empty-state=""
      className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-10"
    >
      <p className="font-display text-2xl text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
