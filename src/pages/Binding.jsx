import binding from '../assets/images/services/mücellet.jpg'
const blocks = [
  {
    title: 'Tel Dikiş & Amerikan Cilt',
    copy:
      'Dikiş ve tutkallama süreçlerinde yapıştırma mukavemetini, sayfa düzenini ve teslim dayanıklılığını üst seviyede tutuyoruz. Katalog ve kitaplar için temiz, rafine bitişler.',
    image:
      'https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Sert Kapak & Özel Kapak İşçiliği',
    copy:
      'Sert kapaklı, laklı, gofre veya selefonlu kapak çözümlerinde ölçü, kırım ve mukavva seçimleri üretim öncesi netleştirilir. Premium kitap ve ajanda üretiminde kusursuz ciltleme.',
    image:
      'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1400&q=80',
  },
]

function Binding() {
  return (
    <div className="bg-white text-slate-900">
      <section className="relative w-full overflow-hidden">
        <img
          src={binding}
          alt="Ciltleme ve mücellit"
          className="h-[320px] w-full object-cover sm:h-[420px]"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[rgba(11,18,32,0.6)]" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-center px-6 text-white">
          <p className="text-xs uppercase tracking-[0.45em] text-amber-200">Hizmetlerimiz</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Mücellit</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-100 sm:text-base">
            Ciltleme ve kapak işlerinde endüstriyel kaliteyi premium bitişlerle buluşturuyoruz.
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

export default Binding
