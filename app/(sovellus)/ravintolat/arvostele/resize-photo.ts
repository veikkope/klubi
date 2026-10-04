import { PHOTO_MAX_EDGE, PHOTO_SOURCE_MAX_BYTES, PHOTO_TARGET_BYTES } from "@/lib/arvostelukuvat";

/**
 * Kuvan pienennys selaimessa ennen lähetystä (docs/18).
 *
 * - Puhelimen 3–10 Mt:n kuva → JPEG, pidempi sivu enintään 1600 px, noin 200–600 kt.
 *   Näin koko lomake mahtuu palvelintoiminnon kokorajaan ja lähetys on nopea
 *   myös mobiiliyhteydellä.
 * - Kuva piirretään canvasille, joten tulokseen ei siirry metatietoja
 *   (EXIF, GPS-sijainti, laitteen tiedot).
 * - Suunta luetaan EXIFistä purettaessa (`imageOrientation: "from-image"`),
 *   joten pystykuva pysyy pystyssä, vaikka suuntatieto häviää.
 * - Läpinäkyvä tausta (PNG) täytetään valkoisella, koska JPEG ei tue läpinäkyvyyttä.
 *
 * iPhonen HEIC-kuvat: Safari muuntaa ne tiedostovalinnassa JPEG:ksi, ja
 * Safari osaa myös purkaa HEIC:n. Jos selain ei osaa purkaa tiedostoa, heitetään
 * `PhotoError`, jonka viesti näytetään käyttäjälle.
 */

export class PhotoError extends Error {}

const QUALITIES = [0.85, 0.78, 0.7, 0.6];

type Source = { image: CanvasImageSource; width: number; height: number; close: () => void };

async function decode(file: Blob): Promise<Source> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { image: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Vanhempi selain ei tunne asetusta tai muotoa: kokeillaan <img>-elementtiä.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    // <img> noudattaa EXIF-suuntaa oletuksena (CSS image-orientation: from-image).
    return { image: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function resizePhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") && file.type !== "") {
    throw new PhotoError("Tiedosto ei ole kuva. Valitse valokuva (JPEG, PNG, WebP tai HEIC).");
  }
  if (file.size > PHOTO_SOURCE_MAX_BYTES) {
    throw new PhotoError("Kuva on liian suuri käsiteltäväksi. Valitse pienempi kuva.");
  }

  let source: Source;
  try {
    source = await decode(file);
  } catch {
    throw new PhotoError(
      "Kuvaa ei voitu avata. Tallenna se JPEG-muodossa tai valitse toinen kuva.",
    );
  }

  try {
    if (!source.width || !source.height) throw new PhotoError("Kuvaa ei voitu avata.");
    const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new PhotoError("Selaimesi ei pysty käsittelemään kuvaa.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source.image, 0, 0, width, height);

    let blob: Blob | null = null;
    for (const quality of QUALITIES) {
      blob = await toBlob(canvas, quality);
      if (blob && blob.size <= PHOTO_TARGET_BYTES) break;
    }
    // Vapautetaan canvasin muisti heti (iOS:n Safari rajoittaa canvasien kokonaismuistia).
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) throw new PhotoError("Kuvan käsittely epäonnistui. Yritä uudelleen.");
    return blob;
  } finally {
    source.close();
  }
}
