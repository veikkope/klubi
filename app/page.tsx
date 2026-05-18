import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative isolate overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.35),_transparent_60%)]" />
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32 lg:py-40">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-200">
            Perustettu 2007
          </p>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-tight sm:text-7xl">
            Lahden Suomalainen Klubi
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-100">
            Yhdistys joka kokoaa lahtelaiset perinteen, jalkapallon ja hyvän
            seuran ääreen. Tapahtumat, jäsenyys ja arkisto — yhdessä paikassa.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/jasenyys/liity"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 font-medium text-brand-900 transition hover:bg-brand-50"
            >
              Liity jäseneksi
            </Link>
            <Link
              href="/tapahtumat"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-6 font-medium text-white transition hover:bg-white/10"
            >
              Tulevat tapahtumat
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">
          Tervetuloa
        </p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
          Sivusto on rakenteilla
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Lahden Suomalainen Klubi ry uudistaa verkkosivunsa. Tämä on
          esinäkymä — sisältö siirretään vanhalta sivustolta vaiheittain.
          Tervetuloa pian takaisin.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Tapahtumat",
              text: "Tulevat ja menneet tilaisuudet.",
              href: "/tapahtumat",
            },
            {
              title: "Jäsenyys",
              text: "Liity klubin jäseneksi.",
              href: "/jasenyys",
            },
            {
              title: "Arkisto",
              text: "Jalkapallotilastot, stadionit ja ravintolaarvostelut.",
              href: "/jalkapallo",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-brand-300 hover:shadow-lg"
            >
              <h3 className="font-serif text-xl">{item.title}</h3>
              <p className="mt-2 text-muted">{item.text}</p>
              <span className="mt-4 inline-block font-medium text-accent transition group-hover:translate-x-1">
                Lue lisää →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
