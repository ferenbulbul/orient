import machine from "../assets/images/machine/machine.jpg";
import parkur1 from "../assets/images/machine/parkur1.jpg";
import parkur2 from "../assets/images/machine/parkur2.jpg";
import parkur3 from "../assets/images/machine/parkur3.jpg";
const STAGES = [
  {
    id: 'prepress',
    title: 'Baskı Öncesi',
    image:
      parkur1,
    items: [
      { no: 1, name: 'Mac Pro Quad-Core', size: 'Standart', qty: 2 },
      { no: 2, name: 'PC', size: 'Standart', qty: 3 },
      { no: 3, name: 'Eizo Color Edge', size: 'Standart', qty: 2 },
      { no: 4, name: 'HP Designjet T794 44in', size: 'Standart', qty: 1 },
      { no: 5, name: 'Kodak Magnus 800 Quantum', size: '70x100', qty: 1 },
    ],
  },
  {
    id: 'press',
    title: 'Baskı',
    image:
      parkur2,
    items: [
      { no: 1, name: 'Roland RZK 1+1 - 2+0', size: '70x100', qty: 1 },
      { no: 2, name: 'Roland RZK 1+1 - 2+0', size: '70x100', qty: 1 },
      { no: 3, name: 'Roland 704 2+2 - 4+0', size: '70x100', qty: 1 },
      { no: 4, name: 'Komori Lithrone S40 4+4 - 8+0', size: '70x100', qty: 1 },
    ],
  },
  {
    id: 'postpress',
    title: 'Baskı Sonrası',
    image:
      parkur3,
    items: [
      { no: 1, name: 'MBO 4 Çanta 2 Balta', size: '64x90', qty: 1 },
      { no: 2, name: 'MBO 8 Çanta', size: '70x100', qty: 1 },
      { no: 3, name: 'Haidelberg Stahl 4 Çanta 2 Balta', size: '70x100', qty: 1 },
      { no: 4, name: 'Eurocutter Schneider 115', size: 'Standart', qty: 1 },
      { no: 5, name: 'Smyth thread F150', size: 'Standart', qty: 1 },
      { no: 6, name: 'Wohlenberg Golf 370', size: '20 İstasyon', qty: 1 },
      { no: 7, name: 'Müller Martini Persto', size: '6 İstasyon', qty: 1 },
      { no: 8, name: 'Otomatik Bandrol', size: 'Standart', qty: 1 },
      { no: 9, name: 'Köşe Kesim', size: 'Standart', qty: 1 },
      { no: 10, name: 'Kazanlı Kesim', size: 'Standart', qty: 1 },
    ],
  },
]

function MachinePark() {
  return (
    <div className="bg-white text-slate-900">
      <section className="relative w-full overflow-hidden">
        <img
          src={machine}
          alt="Makine parkuru"
          className="h-[360px] w-full object-cover sm:h-[420px]"
        />
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="absolute inset-0 mx-auto flex max-w-5xl flex-col justify-center px-6 text-white">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Üretim Gücü</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Makine Parkuru
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-100 sm:text-lg">
            Ofset, dijital baskı ve mücellit hatlarımız; planlı bakım ve otomasyon destekli
            kontrol sistemleri ile 7/24 üretim kabiliyetine sahiptir.
          </p>
        </div>
      </section>

      <div className="bg-slate-50/50">
        <div className="mx-auto max-w-6xl space-y-16 px-6 py-16 sm:py-20">
          {STAGES.map((stage, index) => (
            <section key={stage.id} id={stage.id} className={`scroll-mt-32 ${index !== 0 ? 'pt-4' : ''}`}>
              <div className="flex flex-col gap-8 sm:gap-10">
                <div className="flex flex-col gap-3">
                  <p className="text-xs uppercase tracking-[0.5em] text-amber-500/80">Makine Parkuru</p>
                  <h3 className="text-3xl font-semibold text-slate-900">{stage.title}</h3>
                </div>

                <div
                  className={`flex flex-col gap-6 lg:items-stretch lg:gap-8 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex h-[260px] items-center rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-[0_20px_44px_rgba(15,23,42,0.12)] backdrop-blur sm:h-[300px] lg:h-[320px]">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.45em] text-amber-500">Üretim Notu</p>
                        <p className="mt-3 text-sm text-slate-600">
                          Endüstriyel hatlarımız planlı bakım, hassas kalibrasyon ve sürekli kontrolle tutarlı üretim
                          kalitesi sunar.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative h-[260px] overflow-hidden rounded-2xl border border-slate-200/70 shadow-[0_22px_44px_rgba(15,23,42,0.12)] sm:h-[300px] lg:h-[320px]">
                      <img
                        src={stage.image}
                        alt={stage.title}
                        className="h-full w-full object-cover object-center transition duration-700 ease-out hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/30 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white/85 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                  <div className="grid grid-cols-12 border-b border-slate-200 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.4em] text-[#c1121f]">
                    <span className="col-span-2">#</span>
                    <span className="col-span-6">Ürün</span>
                    <span className="col-span-2 text-right">Ebat</span>
                    <span className="col-span-2 text-right">Adet</span>
                  </div>
                  <div className="divide-y divide-slate-100/80">
                    {stage.items.map((row) => (
                      <div
                        key={`${stage.id}-${row.no}-${row.name}`}
                        className="grid grid-cols-12 items-center px-5 py-3 text-sm text-slate-800 transition hover:bg-slate-50/90"
                      >
                        <span className="col-span-2 font-semibold text-slate-500">{row.no}</span>
                        <span className="col-span-6 leading-snug">{row.name}</span>
                        <span className="col-span-2 text-right text-slate-600">{row.size}</span>
                        <span className="col-span-2 text-right font-semibold">{row.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MachinePark
