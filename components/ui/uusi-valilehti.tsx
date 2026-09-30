/**
 * Ruudunlukijalle: linkki avautuu uuteen välilehteen (WCAG 3.2.5, G201).
 * Lisätään linkin tekstin perään kaikkiin `target="_blank"`-linkkeihin.
 */
export const UUSI_VALILEHTI = "avautuu uuteen välilehteen";

export function UusiValilehti() {
  return <span className="sr-only"> ({UUSI_VALILEHTI})</span>;
}
