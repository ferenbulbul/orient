# Katalog Tohum Verisi

Kaynak: EuromatFMS "İşlem Fiyatlandırma" (176 kayıt, 27.07.2026 ekran
görüntüleri) ve "Stok Kartları" (124 kayıt, 27.07.2026). Bu dosya
`supabase-add-teklif.sql` tohum insert'lerinin kaynağıdır.

Sütun anlamları (bkz. teklif-hesaplama.md §10):
**Pb** para birimi · **Adet** dahil tiraj · **Forma** min forma çarpanı ·
**K1/F1** kademe-1 taban/birim · **Ebat** kademe eşiği · **K2/F2** kademe-2.
`?` = ekran görüntüsünde net okunamadı, teyit gerekli.

---

## 1. Baskı makineleri

| Ad | İstasyon | Pb | Dahil adet | K1 | F1 | Eşik | K2 | F2 |
|---|---|---|---|---|---|---|---|---|
| Tek Renk | R 1/1 | ₺ | 3.000 | 750 | 0,15 | 7000 | 750 | 0,15 |
| 5_Renk | 5.Renk | ₺ | 3.000 | 900 | 0,175 | 8000 | 800 | 0,15 |
| 8_Renk | 8.Renk | ₺ | 3.000 | 850 | 0,175 | 8000 | 750 | 0,15 |
| Dijital | Xerox_280 | ₺ | 1 | 5 | 5 | 7000 | — | — |

Doğrulama: Tek Renk 750/0,15 ve 5_Renk 900/0,175/3.000 gerçek işlerle
birebir tutuyor (teklif-hesaplama.md §3).

## 2. Cilt işlemleri (Acoro istasyonu, hesap: forma bazlı)

| Ad | Adet | MinForma | K1 | F1 | Eşik | K2 | F2 |
|---|---|---|---|---|---|---|---|
| Amerikan Cilt | 1.000 | 10 | 4000 | 0,4 | 8000 | 4000 | 0,4 |
| Amerikan Cilt Kulaklı | 1.000 | 10 | 5000 | 0,5 | 8000 | 5000 | 0,5 |
| Amerikan Cilt Silikon Tutkallı | 1.000 | 10 | 7000 | 0,7 | 7000 | 400? | 0,45 |
| Amerikan Cilt Yarım Tutkal | 1.000 | 10 | 4000 | 0,4 | 7000 | 400? | 0,4 |
| Silikonlu Amerikan Cilt | 1.000 | 10 | 7000 | 0,7 | 3501 | 1200 | 0,45 |
| Pur Cilt | 1.000 | 10 | 750 | 0,08 | 437,5 | 1000 | 0,075 |
| Harman (forma) | 1.000 | 8 | 2000 | 0,15 | 437,5 | 2000 | 0,15 |
| Harman (Kitap) | 1.000 | 1 | 2000 | 0,5 | 437,5 | 150 | 0,5 |
| Harman (yaprak) | 0 | 1 | 0 | 0,03 | 437,5 | — | 0,03 |

## 3. Dikişler (hesap: adet bazlı)

| Ad | İstasyon | Adet | K1 | F1 | Eşik | K2 | F2 |
|---|---|---|---|---|---|---|---|
| İplik Dikiş | İplik Dikiş | 10.000 | 7000 | 0,7 | 631 | 7000 | 0,7 |
| Tel Dikiş | Tel Dikiş | 1.000 | 2000 | 0,3 | 8000 | 750 | 0,25 |
| Tel Dikiş (Kendinden Kapaklı) | Tel Dikiş | 1.000 | 2000 | 0,25? | 8000 | 2500 | 0,25 |
| Omega Tel Dikiş (2'li) | Tel Dikiş | 1.000 | 500 | 0,025? | 3500 | 350 | 0,035 |
| Omega Tel Dikiş (4'lü) | Tel Dikiş | 1.000 | 500 | 0,045 | 8000 | 500 | 0,05 |

## 4. Selefonlar (hesap: m² bazlı, fiyatlar **$/m²**)

| Ad | Pb | K1 (taban ₺) | F1 ($/m²) |
|---|---|---|---|
| Parlak Selefon | $ | 750 | 0,13 |
| Mat Selefon | $ | 800 | 0,14 |
| Parlak Selefon Pur | $ | 300 | 0,11 |
| Mat Selefon Pur | $ | 300 | 0,12 |
| Kadife Selefon | $ | 500 | 0,55 |
| Çizilmez Mat Selefon | $ | 500 | 0,6 |
| Metalize Selefon | ₺? | 500 | 0,35 |
| Sedef Selefon | ₺? | 500 | 0,18 |

Doğrulama: Parlak 0,13 $ × kur = 6,105/6,147/6,152 — üç günün teklif
ekranıyla birebir ✓. Taban 750 ✓ (Kalıp sütunu).

## 5. Laklar / kaplamalar (m² veya tabaka bazlı)

| Ad | Adet | K1 | F1 | Eşik | K2 | F2 | Ek (KB/Mlz) |
|---|---|---|---|---|---|---|---|
| Dış Lak Mat | 1.000 | 500 | 0,3 | 8000 | — | 0,3 | |
| Dış Lak Parlak | 1.000 | 500 | 0,3 | 8000 | — | 0,3 | |
| Dış Lak YarıMat | 1.000 | 500 | 0,2 | 8000 | — | 0,2 | |
| Emboss Lak | 1.000 | 800 | 0,5 | 3501 | 800 | 1,5 | |
| Efect Lak | 1.000 | 350 | 0,66 | 7000 | | | |
| Kumlu Lak %20 | 1.000 | 350 | 0,66 | 7000 | | | |
| Kabartma Lak %20 | 1.000 | 175 | 0,175 | 3500 | 250 | 0,25 | |
| Lokal Lak %20 | 1.000 | 250 | 0,325? | 3501 | 600 | 0,425 | |
| Lokal Lak %30 | 1.000 | 425 | 0,4 | 3501 | 650 | 0,475 | |
| Lokal Lak %40 | 1.000 | 550 | 0,455 | 3501 | 700 | 0,52 | |
| Lokal Lak %50–%90 | 1.000 | 200 | 0,25 | 3501 | 300 | 0,185–0,265 | kademeli |
| Simli Lak %20/%30 | 1.000 | 175 | 0,7 | 3501 | 250 | 0,7 | |
| Termo Lak | 1.000 | 150 | 0,13 | 3500 | 250 | 0,26 | |
| Tümsek Lak | 1.000 | 300 | 0,18 | 3500 | 350 | 0,228 | |
| Twin Lak | 0 | 300 | 0,5 | 3500 | 500 | 1 | |
| Lak UV | 0 | 150 | 0,45 | 8000 | 150 | 0,45 | |
| Pileki Lak | 1 | 0 | 1,9 | 3501 | 150 | 0,1? | |
| Vernik Mat | 3.000 | 500 | 0,25 | 8000 | — | 0,25 | Mlz 0,003 |
| Vernik Parlak | 3.000? | 500 | 0,25 | 8000 | — | 0,25 | Mlz 0,004 |
| Kalıplı Vernik | 1.000 | 500 | 0,25 | 8000 | — | 0,25 | Mlz 0,004 |
| Jelatinleme | 0 | 100 | 0,65 | 7000 | | | |
| PVC Kaplama | 0 | — | 1 | 7000 | | | |

## 6. Kırım / katlama (Haidelberg_Kırım vb.)

| Ad | İstasyon | Adet | K1 | F1 | Eşik | Not |
|---|---|---|---|---|---|---|
| Kırım Tek | Haidelberg_Kırım | 0 | 100 | 0,03 | 7000 | |
| Kırım İki | MBO_Kırım | 0 | 100 | 0,010 | 7000 | |
| Kırım Üç | Haidelberg_Kırım | 0 | 100 | 0,015 | 7000 | |
| Kırım Dört | Otomatik Haidelberg | 1.000 | 100 | 0,02 | 7000 | |
| Kırım M / Paralel / Z | Haidelberg_Kırım | 0 | 100 | 0,018 | 7000 | |
| Akordeon | Haidelberg_Kırım | 1.000 | 100 | 0,03 | 3500 | K2 100/0,03 |
| Getfold katlama | Haidelberg_Kırım | 10.000 | 100 | 0,04 | 3500 | K2 100/0,04 |
| Harita Katlama | Haidelberg_Kırım | 1.000 | 500 | 0,5 | 8000 | K2 250/0,15 |
| Tutkallı Kırım | MBO_Tutkal | 10.000 | 200 | 0,0175 | 1750 | K2 200/0,0225 |
| Elde Katlama | Tezgah 1 | 0 | 100 | 0,025 | 1750 | |

Not: Gerçek işlerde kırım satırları 0 ₺ geçilmiş (cilt fiyatına dahil
sayılıyor); kartta fiyat olsa da teklif iskeletinde 0 önerilecek.

## 7. Kesimler

| Ad | İstasyon | Adet | K1 | F1 | Eşik | K2 | F2 | KB |
|---|---|---|---|---|---|---|---|---|
| Düz Kesim | Gyotin | 0 | 1000 | 0,01 | 3500 | 1500 | 0,02 | |
| Özel Kesim | Fason | 1.000 | 2000 | 1 | 3500 | 650 | 0,25 | 150/0,1 |
| Pedal Kesim | Fason | 1.000 | 100? | 0,13? | 3750 | 300 | 0,2 | 150/0,1 |
| Yarım Kesim | Fason | 1.000 | 1500 | 0,75 | 1750? | 1000 | 0,75 | 150/0,1 |
| Puzzle Kesim | Fason | 1.000 | 0 | 1 | 7000 | | | 150/0,1 |
| Parmak Kesim | Tezgah 1 | 1 | 300 | 1,5 | 7000 | | | |
| Fihrist kesim | Fason | 0 | — | — | 7000 | | | |
| Perforaj | Fason | 1.000 | 50 | 0,035 | 3500 | 100 | 0,07 | Mlz 100/0,05 |
| Delik Açma | Tezgah 1 | 0 | 150 | 0,03 | 1750 | 150 | 0,04 | |
| Radüs Kesim | Fason | 0 | 100 | 0,4 | 3500 | 100 | 0,04? | |
| Dilimleme | Fason | 0 | 100 | 0,01 | 7000 | | | |

## 8. Süsleme / özel işlemler (Fason)

| Ad | Adet | K1 | F1 | Eşik | K2 | F2 | KB/Mlz |
|---|---|---|---|---|---|---|---|
| Varak Altın / Gümüş / Renkli | 1.000 | 250 | 0,13 | 3500 | 400 | 0,2 | KB 250/1,6 + 150/0,2 |
| Kabartma | — | — | — | 3500 | | | KB 250/1,6 |
| Deboss (çökertme) | 1.000 | — | — | 3500 | | | KB 250/1,6 |
| Yakma Baskı | 0 | — | — | 3500 | | | KB 250/1,6 |
| Gofre | 1.000 | 400 | 0,04 | 3500 | 600 | 0,06 | KB 200/0,8 |
| Çökertme | 1.000 | 100 | 0,025 | 3500 | 150 | 0,04 | KB 100/0,05 |
| Numaratör | 0 | 75 | 0,025 | 3500 | 100 | 0,05 | |
| Serigrafi Baskı | 3.000 | 200 | 0,3 | 3500 | — | 0,025? | |
| Kenar Yaldız | 0 | — | — | 1750 | | | |
| Sedef/Metalize (bkz. selefon) | | | | | | | |

## 9. Ambalaj / paketleme

| Ad | İstasyon | K1 | F1 | Not |
|---|---|---|---|---|
| Shrink | Tezgah 1 | — | 3 | işlerde paket başı 10 girilmiş (elle ezme) |
| Koli | Tezgah 1 | 100 | 15 | |
| Kraft Paket | Tezgah 1 | — | 0,35 | |
| Lastik Paket | Fason | 100 | 0,05 | |
| Poşetleme | Fason | 60 | 0,08? | |
| Jelatinleme | Fason | 100 | 0,65 | |
| Kuşak Atma | Tezgah 1 | 60 | 0,1 | |
| Euro Palet | — | 100 | 1000 | |

## 10. Sevkiyat (hesap: sabit tutar)

| Ad | Tutar ₺ |
|---|---|
| 1 ton Anadolu yakası | 2.000 |
| 1 ton Avrupa yakası | 1.000 |
| 2 ton Anadolu | 500? |
| 2 ton Avrupa | 400 |
| 5 ton Anadolu | 1.000 |
| 5 ton Avrupa | 750 |
| 10 ton Anadolu | 1.250 |
| 10 ton Avrupa | 1.000 |
| Kargo Matbaadan | 300 |
| Fason Nakliye | 150 |

(2 ton > 1 ton fiyatı tutarsız görünüyor — 1 ton 2.000 net okunuyor,
2 ton 500/400; teyit edilecek.)

## 11. Tezgah mikro-işlemleri (hesap: adet bazlı, taban 60-100 ₺)

Ayak Yapıştırma 60/0,03 · Ayıklama 200/0,3 · Ayraç Alma 60/0,04 ·
Bandrol Yapıştırma 60/0,08 · Bant Yapıştırma 60/0,05 · Doldurma 100/1 ·
Dosya Çift Cep Yapıştırma 100/0,1–0,2 · Dosya Tek Cep 100/0,1 ·
Dosya Teli Takma 100/0,06 · Kapak Yapıştırma 200/0,2 · Kroşe Takma 60/0,06 ·
Kurdela 60/0,03 · Kuş Gözü Çakma 100/0,15 · Kutu Taslama 100/1,5 ·
Kutu Yapıştırma 100/0,06 · Küp Bloknot 60/0,05 · Lastik Takma — ·
Mıknatıslı Kilit 60/0,03 · Misina Bağlama 100/0,16? · Parçalama Dolum
100/0,15 · Pliyaj 100/0,03 · Pvc Yapıştırma 60/0,04 · Sayım 100/0,003 ·
Sırt Sürme 150/0,1→250/0,15 · Sıvama (birbirine) 0/0,4 · Sıvama (mukavva)
0/0,6 · Şerase 60/0,03 · Şömiz Takma 100/0,4 · Taslama 100/0,35 ·
Tutkal 60/0,02 · Üstten Bloknotlar 60/0,04–0,52 · Vantuz Takma 60/0,06 ·
Yan/Dip Yapıştırma 100–500/0,02–0,05 · Yapıştırma 60/0,03 ·
Çanta yapımı (tek/iki parça, boylara göre) 0/0,55–0,8 ·
Flexi Kapak Takma 0/2 · Flexi Kapak Yapıştırma 200/0,2 ·
Sert Kapak 0/2,5–3 · Stand Ayağı —/1 · Sprial — · Şerit vb. —

## 12. Kağıt kartları (stok ekranından, SATIŞ fiyatı + para birimi)

| Cins | Gr | Ebat(lar) | Satış | Pb |
|---|---|---|---|---|
| 1.Hamur | 60 | 64×86 | 1,10 | $ |
| 1.Hamur | 70 | 56,9×79,8 · 57×80 · 57×82 · 57×86 · 57×90 · 58×80 · 58×90 | 1,10 | $ |
| 1.Hamur | 80 | 64×90 · 64×92 | 1,10 | $ |
| 1.Hamur | 90 | 64×90 | 1,10 | $ |
| 1.Hamur | 140 | 64×90 | 1,10 | $ |
| Kitap Kağıdı | 52 | 57×82 | 1,20 | € |
| Kitap Kağıdı | 55 | 57×82 · 68×100 | 1,20 | € |
| Kitap Kağıdı | 60 | 50×80 · 53×82 | 1,20 | € |
| Holmen | 52 | 57×82 | 1,25 | € |
| Holmen | 55 | 57×82 | 1,25 | € |
| Holmen | 65 | 57×90 | 1,25 | € |
| Holmen | 70 | 57×88 | 1,25 | € |
| Ivory | 70 | 57×82 | 1,08 | € |
| Mat Kuşe | 90 | 64×90 | 1,35 | € |
| Mat Kuşe | 130 | 57×82 · 70×100 | 1,35 | € |
| Mat Kuşe | 170 | 57×82 | 1,35 | € |
| Mat Kuşe | 200 | 64×90 | 1,35 | € |
| Mat Kuşe | 250 | 57×82 · 64×90 | 1,35 | € |
| Mat Kuşe | 300 | 64×90 · 70×100 | 1,35 | € |
| Parlak Kuşe | 115 | 64×90 | 1,35 | € |
| Parlak Kuşe | 130 | 64×90 | 1,35 | € |
| Parlak Kuşe | 200 | 70×100 | 1,35 | € |
| Parlak Kuşe | 350 | 64×90 | 1,35 | € |
| Bristol | 200 | 60×80 | 1,00 | $ |
| Bristol | 210 | 60×90 · 70×100 | 1,00 | $ |
| Bristol | 225 | 60×95 | — | |
| Bristol | 230 | 60×80 · 64×86 · 65×86 · 70×100 | 1,00 | $ |
| Bristol | 300 | 64×90 | — | |
| Bristol | 350 | 70×100 | 1,00 | $ |
| Krome Karton | 350 | 58×85 | — | |

Kalınlık (sırt için): tümü v1'de 0,1 mm/yaprak varsayılanı.
Alış fiyatları maliyet takibi için ayrıca kartta tutulabilir (v2).

Not: Stok listesindeki Malzeme türü kayıtlar (boyalar, CTP kalıplar,
tutkal, tel bobini, kimyasallar) teklif kataloğuna GİRMEZ — üretim sarf
malzemesi; fiyatları işlem birim fiyatlarının içinde kabul ediliyor.

---

## Okunamayan / teyit bekleyen hücreler
- `?` işaretli değerler (Silikon Tutkallı K2, Omega 2'li F1, Lokal Lak %20
  F1, Pedal Kesim K1, sevkiyat 1-2 ton tutarsızlığı, Poşetleme F1)
- DENEY işinde Amerikan Cilt satırına gelen 1200/0,08 değerlerinin kart
  kaynağı hâlâ belirsiz (Silikonlu AC K2=1200 ve Pur Cilt F1=0,08 ile
  örtüşüyor ama Amerikan Cilt kartı 4000/0,4) — yeni sistemde sorun değil,
  karttan net değer çekilecek.
