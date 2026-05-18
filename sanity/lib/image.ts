import createImageUrlBuilder from "@sanity/image-url";
import { dataset, hasSanity, projectId } from "../env";

const builder = hasSanity
  ? createImageUrlBuilder({ projectId: projectId!, dataset })
  : null;

type ImageSource = Parameters<NonNullable<typeof builder>["image"]>[0];

export function urlForImage(source: ImageSource | undefined | null) {
  if (!builder || !source) return null;
  return builder.image(source).auto("format").fit("max");
}
