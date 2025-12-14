const machineCategories = [
  {
    title: 'Ofset Baskı Makineleri',
    description:
      'Yüksek tirajlı işler için Heidelberg ve Komori ofset hatlarımız, renk yönetimi ve inline kontrol sistemleri ile çalışır.',
    machines: [
      'Heidelberg Speedmaster XL 106 - 5 Renk + Dispersiyon',
      'Komori Lithrone GL 840P - 8 Renk Ters Simetrik',
      'Heidelberg CD 74 - UV Lak Ünitesi',
    ],
  },
  {
    title: 'Dijital Baskı Makineleri',
    description:
      'Kişiselleştirilmiş ve düşük tirajlı işleri Canon ve Xerox dijital platformlarımızda hızlıca tamamlıyoruz.',
    machines: [
      'Canon imagePRESS V1350 - 135ppm, 350gsm destek',
      'Xerox Iridesse Production - Metalik Toner',
      'HP Indigo 7900 - Gelişmiş renk yönetimi',
    ],
  },
  {
    title: 'Mücellit & Ciltleme',
    description:
      'Dikiş, tutkallama, sert kapak ve spiral çözümleri ile baskı sonrası süreçleri uçtan uca kontrol ediyoruz.',
    machines: [
      'Muller Martini Alegro - Otomatik mücellit',
      'Duplo iSaddle X - İplik dikiş',
      'Kolbus DA 270 - Sert kapak üretimi',
    ],
  },
  {
    title: 'Yardımcı Ekipmanlar',
    description:
      'Kalite kontrol, laminasyon ve kesim süreçlerini destekleyen ekipmanlarımız üretim hattını tamamlar.',
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
          className="h-[360px] w-full object-cover sm:h-[440px]"
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

      <div className="page">
        <section className="section">
          <div className="section__heading">
            <p className="eyebrow">Üretim Altyapısı</p>
            <h2>Kaliteyi tutarlı kılan makinelerimiz.</h2>
            <p>
              Tüm ekipmanlarımızı kalibrasyon programları ve enerji verimliliği odaklı planlarla
              yönetiyoruz. Aşağıda temel kategorilerimiz yer alıyor.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {machineCategories.map((category) => (
              <article key={category.title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.07)]">
                <h3 className="text-2xl font-semibold">{category.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{category.description}</p>
                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  {category.machines.map((machine) => (
                    <li key={machine} className="rounded-xl bg-slate-50 px-3 py-2">
                      {machine}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default MachinePark
