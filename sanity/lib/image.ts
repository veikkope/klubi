import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, hasSanity, projectId } from "../env";

const builder = hasSanity
  ? createImageUrlBuilder({ projectId: projectId!, dataset })
  : null;

type ImageSource = Parameters<NonNullable<typeof builder>["image"]>[0];

/**
 * Perus-URL-rakentaja. Oletuksena `fit("max")` (ei suurenneta, ei rajata).
 * Kun tarvitaan kiinteä mittasuhde, kutsu `.width(w).height(h).fit("crop")`
 * ja välitä koko kuvaobjekti (ml. `hotspot` ja `crop`), jotta toimittajan
 * valitsema polttopiste huomioidaan.
 */
export function urlForImage(source: ImageSource | undefined | null) {
  if (!builder || !source) return null;
  return builder.image(source).auto("format").fit("max");
}
