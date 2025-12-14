const works = [
  {
    id: 'kurumsal-kitapcik',
    title: 'Kurumsal Kitapçık',
    subtitle: 'Tamamen özel tasarım, iplik dikiş cilt',
  },
  {
    id: 'afis-serisi',
    title: 'Poster Serisi',
    subtitle: 'UV baskı, dış mekan dayanımı',
  },
  {
    id: 'ambalaj',
    title: 'Premium Ambalaj',
    subtitle: 'Özel kesim ve sıcak yaldız',
  },
]

function PortfolioGrid() {
  return (
    <section className="section">
      <div className="section__heading">
        <p className="eyebrow">Örnek Çalışmalar</p>
        <h2>İş ortaklarımız için ürettiğimiz seçkiler.</h2>
        <p>
          Görseller placeholder olarak kullanılmaktadır. Talebinize göre detaylı
          referans listesi sunabiliriz.
        </p>
      </div>
      <div className="portfolio-grid">
        {works.map((work) => (
          <article className="card portfolio-card" key={work.id}>
            <div className="portfolio-card__image">
              <img
                src={`https://via.placeholder.com/520x320/111827/ffffff?text=${encodeURIComponent(work.title)}`}
                alt={work.title}
              />
            </div>
            <div>
              <h3>{work.title}</h3>
              <p>{work.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PortfolioGrid
