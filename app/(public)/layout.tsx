import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {/* id vastaa juurilayoutin "Siirry sisältöön" -linkkiä. Alapehmuste
          erottaa sisällön footerista; sivu jonka viimeinen osio on täysleveä
          (etusivu) poistaa sen merkinnällä data-flush-footer. */}
      <main
        id="sisalto"
        className="flex-1 pb-16 sm:pb-24 has-[>[data-flush-footer]]:pb-0"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
