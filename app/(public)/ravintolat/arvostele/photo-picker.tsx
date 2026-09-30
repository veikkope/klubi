"use client";

import { useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { cn } from "@/lib/cn";
import { PHOTO_ALT_MAX, PHOTO_MAX_BYTES, PHOTO_MAX_COUNT } from "@/lib/arvostelukuvat";
import { reviewErrorId, reviewFieldId } from "./form-state";
import { FieldMessages, fieldClass, labelClass } from "./form-ui";
import { PhotoError, resizePhoto } from "./resize-photo";

/**
 * Arvostelun kuvat (valinnainen, enintään 3).
 *
 * Kuvat pienennetään selaimessa heti valinnan jälkeen (resize-photo.ts), ja
 * valmiit JPEG:t pidetään React-tilassa. Lomake liittää ne lähetykseen
 * (review-form.tsx), joten tiedostokenttä itse ei lähetä mitään. Tästä syystä
 * kuvat myös säilyvät, jos palvelin palauttaa lomakkeen virheiden kanssa.
 *
 * Saavutettavuus:
 * - Kuvien lisäys on tavallinen painike (virheyhteenvedon linkki osuu siihen);
 *   varsinainen tiedostokenttä on piilotettu ja painike avaa sen.
 * - Jokaisella kuvalla on oma poistopainike ja kuvauskenttä (alt-teksti).
 * - Käsittelyn tila ja virheet kerrotaan ruudunlukijalle `aria-live`-alueella.
 * - Poiston jälkeen fokus siirtyy lisäyspainikkeeseen, ettei se katoa.
 */

export type PhotoDraft = {
  id: string;
  status: "processing" | "ready";
  /** Pienennetty JPEG; null käsittelyn ajan. */
  blob: Blob | null;
  previewUrl: string | null;
  alt: string;
};

let nextId = 0;
const newId = () => `kuva-${Date.now().toString(36)}-${(nextId++).toString(36)}`;

export function PhotoPicker({
  photos,
  setPhotos,
  consent,
  setConsent,
  error,
}: {
  photos: PhotoDraft[];
  setPhotos: Dispatch<SetStateAction<PhotoDraft[]>>;
  consent: boolean;
  setConsent: (value: boolean) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();
  const labelId = useId();
  const consentId = useId();
  const fieldId = reviewFieldId("kuvat");

  // Esikatselujen muisti vapautetaan, kun lomake poistuu näkyvistä.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  });
  useEffect(
    () => () => {
      for (const p of photosRef.current) if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
    },
    [],
  );

  const remaining = PHOTO_MAX_COUNT - photos.length;
  const processing = photos.some((p) => p.status === "processing");

  async function addFiles(list: FileList | File[]) {
    const files = Array.from(list);
    if (files.length === 0) return;
    const accepted = files.slice(0, Math.max(0, remaining));
    const problems: string[] = [];
    if (files.length > accepted.length) {
      problems.push(
        `Voit liittää enintään ${PHOTO_MAX_COUNT} kuvaa, joten ${files.length - accepted.length} jätettiin pois.`,
      );
    }

    const drafts = accepted.map((): PhotoDraft => ({
      id: newId(),
      status: "processing",
      blob: null,
      previewUrl: null,
      alt: "",
    }));
    setPhotos((prev) => [...prev, ...drafts]);
    setNotice(accepted.length > 0 ? "Käsitellään kuvia…" : problems.join(" "));

    await Promise.all(
      accepted.map(async (file, index) => {
        const { id } = drafts[index];
        try {
          const blob = await resizePhoto(file);
          if (blob.size > PHOTO_MAX_BYTES) throw new PhotoError("Kuva on liian suuri. Valitse toinen kuva.");
          const previewUrl = URL.createObjectURL(blob);
          setPhotos((prev) => {
            // Kävijä ehti poistaa kuvan käsittelyn aikana.
            if (!prev.some((p) => p.id === id)) {
              URL.revokeObjectURL(previewUrl);
              return prev;
            }
            return prev.map((p) => (p.id === id ? { ...p, status: "ready", blob, previewUrl } : p));
          });
        } catch (err) {
          const reason = err instanceof PhotoError ? err.message : "Kuvan käsittely epäonnistui.";
          problems.push(`${file.name || "Kuva"}: ${reason}`);
          setPhotos((prev) => prev.filter((p) => p.id !== id));
        }
      }),
    );

    setNotice(
      problems.length > 0
        ? problems.join(" ")
        : accepted.length === 1
          ? "Kuva lisätty."
          : `${accepted.length} kuvaa lisätty.`,
    );
  }

  function remove(id: string, index: number) {
    const photo = photos.find((p) => p.id === id);
    if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setNotice(`Kuva ${index + 1} poistettu.`);
    // Lisäyspainike tulee näkyviin viimeistään nyt; fokus sinne.
    requestAnimationFrame(() => addButtonRef.current?.focus());
  }

  function setAlt(id: string, alt: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, alt } : p)));
  }

  return (
    // Ryhmä on virheyhteenvedon linkin kohde (tabIndex -1), koska lisäyspainike
    // piiloutuu, kun kuvia on jo enimmäismäärä.
    <div
      id={fieldId}
      role="group"
      aria-labelledby={labelId}
      tabIndex={-1}
      className="flex scroll-mt-28 flex-col gap-1.5 focus:outline-none"
      onDragOver={(e) => {
        if (remaining <= 0 || processing || !e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(e) => {
        if (remaining <= 0 || processing) return;
        e.preventDefault();
        setDragging(false);
        void addFiles(e.dataTransfer.files);
      }}
    >
      <p id={labelId} className={labelClass}>
        {`Kuvat `}
        <span className="font-normal text-muted">(valinnainen)</span>
      </p>
      <p id={hintId} className="text-sm text-muted">
        Enintään {PHOTO_MAX_COUNT} kuvaa ruoasta tai paikasta. Kuvat pienennetään ennen lähetystä, ja
        niistä poistetaan sijaintitiedot. Vältä kuvia, joissa muut ihmiset ovat tunnistettavissa.
      </p>

      {photos.length > 0 && (
        <ul className="mt-2 grid gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => {
            const altId = `${fieldId}-kuvaus-${photo.id}`;
            return (
              <li key={photo.id} className="flex flex-col gap-2 rounded-sm border border-border bg-background p-2.5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-strong">
                  {photo.previewUrl ? (
                    // Paikallinen esikatselu (blob:-osoite), jota next/image ei käsittele.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.previewUrl}
                      alt={photo.alt.trim() || `Liitetty kuva ${index + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-sm text-muted">
                      <span className="flex items-center gap-2">
                        <Spinner />
                        Käsitellään…
                      </span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(photo.id, index)}
                    aria-label={`Poista kuva ${index + 1}`}
                    className="absolute right-1.5 top-1.5 grid size-11 place-items-center rounded-full bg-black/65 text-white transition hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <svg aria-hidden viewBox="0 0 20 20" className="size-5">
                      <path
                        fill="currentColor"
                        d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z"
                      />
                    </svg>
                  </button>
                </div>
                <label htmlFor={altId} className="text-[13px] font-semibold text-foreground">
                  Mitä kuvassa on? <span className="font-normal text-muted">(valinnainen)</span>
                </label>
                <input
                  id={altId}
                  type="text"
                  value={photo.alt}
                  maxLength={PHOTO_ALT_MAX}
                  onChange={(e) => setAlt(photo.id, e.target.value)}
                  placeholder="esim. Paahdettu lohi"
                  autoComplete="off"
                  className={cn(fieldClass, "px-3 py-2 text-[15px]")}
                />
              </li>
            );
          })}
        </ul>
      )}

      {remaining > 0 && (
        <div
          className={cn(
            "mt-2 flex flex-col items-start gap-2 rounded-sm border border-dashed border-border-strong p-4 transition sm:flex-row sm:items-center sm:gap-4",
            dragging && "border-accent bg-accent/5",
          )}
        >
          <button
            ref={addButtonRef}
            type="button"
            // Estää rinnakkaiset lisäykset, jotka voisivat ylittää enimmäismäärän.
            disabled={processing}
            onClick={() => inputRef.current?.click()}
            aria-describedby={[hintId, error && reviewErrorId("kuvat")].filter(Boolean).join(" ")}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-sm border border-border-strong bg-background px-4 text-[15px] font-semibold text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60",
              error && "border-danger",
            )}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5">
              <path
                fill="currentColor"
                d="M9.4 3h5.2l1.8 2H20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.6l1.8-2ZM12 8a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"
              />
            </svg>
            {photos.length === 0 ? "Lisää kuvia" : "Lisää kuva"}
            <span className="font-normal text-muted">
              ({photos.length}/{PHOTO_MAX_COUNT})
            </span>
          </button>
          <span aria-hidden className="text-sm text-muted-soft max-sm:hidden">
            tai vedä kuvat tähän
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            tabIndex={-1}
            aria-hidden
            className="sr-only"
            onChange={(e) => {
              const files = e.currentTarget.files;
              if (files) void addFiles(files);
              // Sama kuva voidaan valita uudelleen poiston jälkeen.
              e.currentTarget.value = "";
            }}
          />
        </div>
      )}

      <p aria-live="polite" className={cn("text-sm", notice && !processing ? "text-muted" : "sr-only")}>
        {notice}
      </p>

      {photos.length > 0 && (
        <div className="mt-2 flex items-start gap-3">
          <input
            id={consentId}
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={error && !consent ? true : undefined}
            aria-describedby={error ? reviewErrorId("kuvat") : undefined}
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brass"
          />
          <label htmlFor={consentId} className="cursor-pointer text-[15px] leading-snug text-foreground">
            Kuvat ovat itse ottamiani, ja klubi saa julkaista ne arvostelun yhteydessä.
            <span className="text-danger">
              {" *"}
              <span className="sr-only">pakollinen</span>
            </span>
          </label>
        </div>
      )}

      <FieldMessages field="kuvat" error={error} />
    </div>
  );
}

function Spinner() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 animate-spin motion-reduce:animate-none">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
