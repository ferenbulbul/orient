import { useEffect, useState } from 'react'

const stats = [
  { label: 'Teslim edilen proje', value: '1200+' },
  { label: 'Üretim kapasitesi', value: '45M baskı/yıl' },
  { label: 'Teslim süresi', value: '5 gün ort.' },
]

function Hero({ onOpenQuoteModal = () => {} }) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / 400, 1)
      setScrollProgress(progress)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
  id="home-hero"
  className="relative min-h-screen w-full overflow-hidden text-white -mt-20 sm:-mt-24 md:-mt-28"
>
  <div
    className="absolute inset-0 w-full overflow-hidden transition duration-300 ease-out"
    style={{
      transform: `scale(${1 + scrollProgress * 0.12})`,
      opacity: `${1 - scrollProgress * 0.3}`,
    }}
  >
    <img
      src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=2000&q=80"
      alt="Orient Matbaa üretim hattı"
      className="h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-slate-950/90" />
  </div>

  <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pt-[30vh] pb-24 lg:flex-row lg:items-start lg:gap-20">
    <div className="flex-1">
      <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
        Kurumsal Baskı Çözümleri
      </p>

      <h1 className="mt-6 text-4xl font-semibold leading-tight text-white drop-shadow sm:text-5xl lg:text-6xl">
        Yüksek hacimli ofset baskıda premium üretim güvencesi.
      </h1>

      <p className="mt-6 max-w-2xl text-base text-slate-100 sm:text-lg">
        Orient Matbaa, ofset ve dijital baskı teknolojilerini tek çatı altında
        buluşturarak satış odaklı kampanyalarınız için tutarlı, hızlı ve
        kusursuz sonuçlar sunar.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={onOpenQuoteModal}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 px-10 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-400/40 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70"
        >
          Teklif Al
        </button>

        <a
          href="#services"
          className="inline-flex items-center justify-center rounded-full border border-white/40 px-10 py-3 text-base font-semibold text-white transition hover:bg-white/10"
        >
          Neler Üretiyoruz
        </a>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.4em] text-slate-200">
        <span className="text-amber-300">Grafik Tasarım</span>
        <span className="h-px w-10 bg-white/40" />
        <span>Baskı</span>
        <span className="h-px w-10 bg-white/40" />
        <span>Mücellit</span>
      </div>
    </div>

    <div className="flex w-full flex-1 flex-col gap-6 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
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

      <div className="text-sm text-slate-200">
        ISO 9001 sertifikalı üretim hatlarımız, tirajınızı gerçek zamanlı takip
        eder; planlanan tarihten sapmadan kapınıza teslim edilir.
      </div>
    </div>
  </div>
</section>

  )
}

export default Hero
