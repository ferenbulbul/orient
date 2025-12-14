function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>Orient Matbaa</strong>
        <p>Profesyonel baskı çözümleri ve yaratıcı tasarımlar.</p>
      </div>
      <div>
        <p>Tel: +90 (216) 000 00 00</p>
        <p>E-posta: info@orientmatbaa.com</p>
      </div>
      <div>
        <p>Adres: İkitelli OSB, İstanbul</p>
        <p>© {new Date().getFullYear()} Orient. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  )
}

export default Footer
