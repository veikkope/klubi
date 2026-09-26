/**
 * Renderöi JSON-LD:n `@graph`-muodossa yhtenä script-tagina.
 *
 * `@graph` on tarkoituksellinen: se sallii dokumenttien viitata toisiinsa
 * `@id`:llä (esim. artikkeli → julkaisija-organisaatio) ilman että samaa
 * organisaatiokuvausta toistetaan joka sivulla.
 */

type Json = Record<string, unknown>;

interface JsonLdProps {
  schema: Json | Json[];
}

export function JsonLd({ schema }: JsonLdProps) {
  const graph = Array.isArray(schema) ? schema : [schema];
  if (graph.length === 0) return null;

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify tuottaa validia JSONia; `<` suojataan jottei se voi
      // katkaista script-tagia.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
