const stats = [
  { label: 'Teslim edilen proje', value: '1200+' },
  { label: 'Üretim kapasitesi', value: '45M baskı/yıl' },
  { label: 'Teslim süresi', value: '5 gün ort.' },
]

function Hero() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80"
          alt="Orient Matbaa üretim hattı"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/90 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex-1">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
            Kurumsal Baskı Çözümleri
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Markanız için full-bleed baskıda kusursuz üretim.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-slate-200 sm:text-lg">
            Orient Matbaa, ofset ve dijital baskı süreçlerini tek çatı altında
            yöneterek yüksek tirajlardan kişiselleştirilmiş çözümlere kadar her
            projede satış odaklı üretim güvencesi sunar.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#contact-cta"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-200 px-10 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-400/40 transition hover:translate-y-[-2px]"
            >
              Teklif Al
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-10 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Hizmetleri Keşfet
            </a>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-semibold text-white sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-200">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="text-sm text-slate-300">
            ISO 9001 sertifikalı üretim hatlarımız, tirajınızı gerçek zamanlı takip
            eder ve planlanan tarihte teslim eder.
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
