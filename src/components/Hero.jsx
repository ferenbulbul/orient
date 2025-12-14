function Hero() {
  return (
    <section className="w-full bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-300">
            Kurumsal Baskı Çözümleri
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Matbaa üretiminde kusursuz kalite, Orient güvencesiyle.
          </h1>
          <p className="mt-6 text-base text-slate-300 sm:text-lg">
            Yüksek tirajlı ofset baskılardan kişiselleştirilmiş dijital işlere kadar
            her ölçekte markaya uçtan uca üretim desteği sunuyoruz. Tasarımı,
            baskıyı ve lojistiği tek ekip yönetir.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#contact-cta"
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-8 py-3 text-base font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Teklif Al
            </a>
            <a
              href="#contact-cta"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3 text-base font-semibold text-white transition hover:border-white"
            >
              İletişime Geç
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 text-sm text-slate-300 sm:text-base">
            <div>
              <p className="text-3xl font-semibold text-white">35+</p>
              <p>Yıllık üretim deneyimi</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">1200+</p>
              <p>Kurumsal proje teslimi</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative">
            <div className="absolute left-6 top-6 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white backdrop-blur">
              ISO 9001
            </div>
            <div className="absolute -left-6 bottom-6 hidden w-48 rounded-2xl bg-slate-900/80 p-4 text-slate-100 shadow-2xl backdrop-blur lg:block">
              <p className="text-sm font-semibold">Tam otomasyon takip</p>
              <p className="text-xs text-slate-300">
                Tirajınız üretim hattının her adımında izlenir.
              </p>
            </div>
            <img
              className="h-full w-full rounded-[32px] object-cover shadow-[0_35px_80px_rgba(15,23,42,0.5)]"
              src="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80"
              alt="Orient Matbaa üretim hattı"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
