import { DownloadIcon, DocumentPdfIcon, LaunchIcon } from "@sanity/icons";
import { Box, Button, Dialog, Flex, Heading, Stack, Text } from "@sanity/ui";
import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "sanity/router";

import { korttiPolku } from "../../../lib/ohje/linkit";
import { OHJE_PDF, OHJE_TULOSTE, PIKAOPAS_PDF, type OhjeKortti } from "../../../lib/ohje/tyypit";
import { KortinRunko, OhjeJuuri } from "./tyylit";

/** Onko tiedosto julkaistu (PDF luodaan erikseen: npm run ohje:pdf). Tulos muistetaan istunnon ajan. */
const saatavilla = new Map<string, Promise<boolean>>();
function tarkistaTiedosto(osoite: string): Promise<boolean> {
  let lupaus = saatavilla.get(osoite);
  if (!lupaus) {
    lupaus = fetch(osoite, { method: "HEAD" })
      .then((r) => r.ok)
      .catch(() => false);
    saatavilla.set(osoite, lupaus);
  }
  return lupaus;
}

function useTiedostoSaatavilla(osoite: string): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let voimassa = true;
    tarkistaTiedosto(osoite).then((tulos) => {
      if (voimassa) setOk(tulos);
    });
    return () => {
      voimassa = false;
    };
  }, [osoite]);
  return ok;
}

type Props = {
  kortti: OhjeKortti;
  osionOtsikko?: string;
  /** Korttilinkin klikkaus (Ohjeet-työkalu vaihtaa korttia, paneeli näyttää sen paikallaan). */
  onAvaaKortti: (id: string, ankkuri: string | null) => void;
  /** Kohta, johon vieritetään avattaessa (otsikon ankkuri). */
  ankkuri?: string | null;
  /** Kapea paneeli: pienempi otsikko, ei tulostuspainikkeita, linkki Ohjeet-työkaluun. */
  paneelissa?: boolean;
};

/**
 * Yksi ohjekortti (generoitu HTML, sanity/ohje/sisalto.generated.ts).
 * - Studio-linkit avautuvat reitittimen kautta ilman sivun uudelleenlatausta;
 *   Ctrl/Cmd-klikkaus ja keskinäppäin avaavat uuteen välilehteen kuten tavallinen linkki.
 * - Kuvan klikkaus (tai Enter/välilyönti) suurentaa kuvan ikkunaan.
 */
export function KorttiNakyma({ kortti, osionOtsikko, onAvaaKortti, ankkuri, paneelissa }: Props) {
  const router = useRouter();
  const runko = useRef<HTMLDivElement>(null);
  const [kuva, setKuva] = useState<{ src: string; alt: string } | null>(null);
  const dialogiId = useId();
  const pdf = useTiedostoSaatavilla(kortti.osio === "pikaopas" ? PIKAOPAS_PDF : OHJE_PDF);

  // Kortin vaihtuessa alkuun tai pyydettyyn kohtaan.
  useEffect(() => {
    const kohde = ankkuri ? document.getElementById(ankkuri) : null;
    if (kohde) kohde.scrollIntoView({ block: "start" });
    else {
      runko.current?.closest("[data-ohje-vieritys]")?.scrollTo({ top: 0 });
      // Kapealla näytöllä koko näkymä vierii: kortin alku näkyviin.
      if (window.matchMedia("(max-width: 52rem)").matches) {
        runko.current?.closest('[data-ohje="kortti"]')?.scrollIntoView({ block: "start" });
      }
    }
  }, [kortti.id, ankkuri]);

  const klikkaus = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const kohde = e.target as Element;
      const kuvanappi = kohde.closest<HTMLButtonElement>("button[data-ohje-kuva]");
      if (kuvanappi) {
        if (kuvanappi.dataset.puuttuu === "1") return;
        const img = kuvanappi.querySelector("img");
        setKuva({ src: kuvanappi.dataset.ohjeKuva ?? "", alt: img?.alt ?? "" });
        return;
      }
      const linkki = kohde.closest<HTMLAnchorElement>("a[href]");
      if (!linkki) return;
      if (linkki.dataset.ohjeKortti) {
        e.preventDefault();
        onAvaaKortti(linkki.dataset.ohjeKortti, linkki.dataset.ohjeAnkkuri ?? null);
      } else if (linkki.dataset.ohjeStudio) {
        e.preventDefault();
        router.navigateUrl({ path: linkki.getAttribute("href") ?? "/studio" });
      }
    },
    [onAvaaKortti, router],
  );

  // Puuttuva kuva (kuvaskripti ajamatta): kuvaus näkyy kehyksessä rikkinäisen kuvan sijaan.
  // Virhetapahtuma ei kupli, joten kuunnellaan kaappausvaiheessa; jo epäonnistuneet tarkistetaan heti.
  useEffect(() => {
    const juuri = runko.current;
    if (!juuri) return;
    const merkitse = (img: HTMLImageElement) => {
      const nappi = img.closest<HTMLButtonElement>("button[data-ohje-kuva]");
      if (!nappi || nappi.dataset.puuttuu === "1") return;
      nappi.dataset.puuttuu = "1";
      nappi.dataset.alt = img.alt;
      nappi.setAttribute("aria-label", `Kuva tulossa: ${img.alt}`);
    };
    const virhe = (e: Event) => {
      if (e.target instanceof HTMLImageElement) merkitse(e.target);
    };
    juuri.addEventListener("error", virhe, true);
    juuri.querySelectorAll("img").forEach((img) => {
      if (img.complete && img.naturalWidth === 0) merkitse(img);
    });
    return () => juuri.removeEventListener("error", virhe, true);
  }, [kortti.html]);

  const tulosta = useCallback(() => {
    window.open(`${OHJE_TULOSTE}?kortti=${encodeURIComponent(kortti.id)}`, "_blank", "noopener");
  }, [kortti.id]);

  return (
    <OhjeJuuri>
      <Stack space={4} data-ohje="kortti" data-ohje-kortti-id={kortti.id}>
        <Stack space={3}>
          {osionOtsikko && !paneelissa ? (
            <Text size={1} muted weight="medium">
              {osionOtsikko}
            </Text>
          ) : null}
          <Heading as={paneelissa ? "h2" : "h1"} size={paneelissa ? 2 : 3}>
            {kortti.otsikko}
          </Heading>
          {kortti.kesto ? (
            <Text size={1} muted>
              Kesto: {kortti.kesto}
            </Text>
          ) : null}
        </Stack>

        {paneelissa ? (
          <Flex>
            <Button
              as="a"
              href={korttiPolku(kortti.id)}
              mode="ghost"
              icon={LaunchIcon}
              text="Avaa Ohjeissa"
              data-ohje="avaa-ohjeissa"
              onClick={(e: MouseEvent<HTMLElement>) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                router.navigateUrl({ path: korttiPolku(kortti.id) });
              }}
            />
          </Flex>
        ) : (
          <Flex gap={2} wrap="wrap">
            <Button
              mode="ghost"
              icon={DocumentPdfIcon}
              text="Tulosta tämä ohje"
              onClick={tulosta}
              data-ohje="tulosta"
            />
            {pdf ? (
              <Button
                as="a"
                href={kortti.osio === "pikaopas" ? PIKAOPAS_PDF : OHJE_PDF}
                download
                mode="ghost"
                icon={DownloadIcon}
                text={kortti.osio === "pikaopas" ? "Lataa pikaopas (PDF)" : "Lataa koko ohje (PDF)"}
                data-ohje="lataa-pdf"
              />
            ) : null}
          </Flex>
        )}

        <Box>
          <KortinRunko
            ref={runko}
            onClick={klikkaus}
            // Lähde on repon docs/ohje/, ja markdown-it escapaa sen raa'an HTML:n (html: false).
            dangerouslySetInnerHTML={{ __html: kortti.html }}
          />
        </Box>

        {kuva ? (
          <Dialog
            id={`ohje-kuva-${dialogiId}`}
            header={kuva.alt || "Kuva"}
            onClose={() => setKuva(null)}
            onClickOutside={() => setKuva(null)}
            width="auto"
            zOffset={1000}
          >
            <Box padding={3}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Studion staattinen kuva, ei Next.js-sivu */}
              <img
                src={kuva.src}
                alt={kuva.alt}
                style={{ display: "block", maxWidth: "100%", maxHeight: "80vh", height: "auto" }}
              />
            </Box>
          </Dialog>
        ) : null}
      </Stack>
    </OhjeJuuri>
  );
}
