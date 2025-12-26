const machineCategories = [
  {
    id: 'ofset-baski',
    title: 'Ofset Baskı Makineleri',
    description:
      'Yüksek tirajlı işler için Heidelberg ve Komori ofset hatlarımız, renk yönetimi ve inline kontrol sistemleri ile çalışır.',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    machines: [
      'Heidelberg Speedmaster XL 106 - 5 Renk + Dispersiyon',
      'Komori Lithrone GL 840P - 8 Renk Ters Simetrik',
      'Heidelberg CD 74 - UV Lak Ünitesi',
    ],
  },
  {
    id: 'dijital-baski',
    title: 'Dijital Baskı Makineleri',
    description:
      'Kişiselleştirilmiş ve düşük tirajlı işleri Canon ve Xerox dijital platformlarımızda hızlıca tamamlıyoruz.',
    image:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80',
    machines: [
      'Canon imagePRESS V1350 - 135ppm, 350gsm destek',
      'Xerox Iridesse Production - Metalik Toner',
      'HP Indigo 7900 - Gelişmiş renk yönetimi',
    ],
  },
  {
    id: 'mucellit-ve-cilt',
    title: 'Mücellit & Ciltleme',
    description:
      'Dikiş, tutkallama, sert kapak ve spiral çözümleri ile baskı sonrası süreçleri uçtan uca kontrol ediyoruz.',
    image:
      'https://images.unsplash.com/photo-1481988535861-271139e06469?auto=format&fit=crop&w=1600&q=80',
    machines: [
      'Muller Martini Alegro - Otomatik mücellit',
      'Duplo iSaddle X - İplik dikiş',
      'Kolbus DA 270 - Sert kapak üretimi',
    ],
  },
  {
    id: 'yardimci-ekipmanlar',
    title: 'Yardımcı Ekipmanlar',
    description:
      'Kalite kontrol, laminasyon ve kesim süreçlerini destekleyen ekipmanlarımız üretim hattını tamamlar.',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    machines: [
      'Polar N 137 AT - Hidrolik kesim',
      'Foliant Mercury 760 - Laminasyon',
      'GMG ColorProof sistemi - Renk doğrulama',
    ],
  },
]

function MachinePark() {
  return (
    <div className="bg-white text-slate-900">
      <section className="relative w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80"
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

      {/* <div className="page">
        <section className="section">
          <div className="section__heading">
            <p className="eyebrow">Üretim Altyapısı</p>
            <h2>Kaliteyi tutarlı kılan makinelerimiz.</h2>
            <p>
              Tüm ekipmanlarımızı kalibrasyon programları ve enerji verimliliği odaklı planlarla
              yönetiyoruz. Aşağıda temel kategorilerimiz yer alıyor.
            </p>
          </div>
        </section>
      </div> */}

      <div className="bg-slate-50/50">
        <div className="mx-auto max-w-6xl space-y-16 px-6 py-16 sm:py-20">
          {machineCategories.map((category, index) => (
            <section
              key={category.id}
              id={category.id}
              className={`scroll-mt-32 ${index !== 0 ? 'pt-4' : ''}`}
            >
              <div
                className={`flex flex-col items-stretch gap-10 lg:gap-14 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
              >
                <div className="lg:w-1/2">
                  <div className="relative overflow-hidden rounded-[32px] shadow-[0_30px_60px_rgba(15,23,42,0.18)]">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="h-full w-full object-cover transition duration-700 ease-out hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/30 via-transparent to-transparent" />
                  </div>
                </div>
                <div className="flex flex-col justify-center lg:w-1/2">
                  <p className="text-xs uppercase tracking-[0.5em] text-amber-500/80">
                    Makine Parkuru
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold text-slate-900">
                    {category.title}
                  </h3>
                  <p className="mt-4 text-base text-slate-600">{category.description}</p>
                  <ul className="mt-6 space-y-3">
                    {category.machines.map((machine) => (
                      <li
                        key={machine}
                        className="flex items-start gap-3 rounded-2xl bg-white/90 p-4 text-sm font-medium text-slate-800 shadow-[0_15px_35px_rgba(15,23,42,0.08)]"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                        <span>{machine}</span>
                      </li>
                    ))}
                  </ul>
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
