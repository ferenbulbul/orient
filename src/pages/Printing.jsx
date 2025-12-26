const blocks = [
  {
    title: 'Ofset Baskı Hattı',
    copy:
      'Yüksek tirajlı işler için 4-8 renk ofset makinelerimizde renk tutarlılığı, lak ve kesim süreçlerini tek akışta yönetiyoruz. ISO renk standartlarıyla doğrulanmış üretim.',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Dijital & Kişiselleştirme',
    copy:
      'Düşük tirajlı, değişken verili veya acil teslimatlar için dijital baskı hatları kullanıyoruz. Kişiselleştirilmiş katalog, broşür ve kitap baskıları kısa sürede tamamlanır.',
    image:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80',
  },
]

function Printing() {
  return (
    <div className="bg-white text-slate-900">
      <section className="relative w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1800&q=80"
          alt="Ofset ve dijital baskı"
          className="h-[320px] w-full object-cover sm:h-[420px]"
        />
        <div className="absolute inset-0 bg-[rgba(11,18,32,0.6)]" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-center px-6 text-white">
          <p className="text-xs uppercase tracking-[0.45em] text-amber-200">Hizmetlerimiz</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Baskı</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-100 sm:text-base">
            Ofset ve dijital hatlarımızla tiraj, hız ve kalite dengesini işinize özel kuruyoruz.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mt-10 space-y-8">
            {blocks.map((item, index) => (
              <div
                key={item.title}
                className={`grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] lg:grid-cols-2 ${
                  index % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''
                }`}
              >
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Printing
