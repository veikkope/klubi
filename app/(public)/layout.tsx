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
      {/* id vastaa juurilayoutin "Siirry sisältöön" -linkkiä. */}
      <main id="sisalto" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
