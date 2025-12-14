import PortfolioGrid from '../components/PortfolioGrid'

function Portfolio() {
  return (
    <div className="page">
      <section className="section section--narrow">
        <p className="eyebrow">Çalışmalarımız</p>
        <h1>Seçili baskı projelerimizi keşfedin.</h1>
        <p>
          Tasarım stüdyolarından kurumsal markalara uzanan geniş müşteri
          portföyümüzden örnekleri aşağıda derledik. Görseller placeholder olarak
          kullanılmaktadır.
        </p>
      </section>
      <PortfolioGrid />
    </div>
  )
}

export default Portfolio
