import emailjs from 'emailjs-com'

export const sendQuoteRequest = (form) => {
  return emailjs.send(
  'service_iisc2mc',
  'template_lbbtv6j',
  {
    productType: form.productType,
    quantity: form.quantity,
    pageCount: form.pageCount,
    size: form.size,

    company: form.company,
    name: form.name,
    email: form.email,
    phone: form.phone,

    notes: form.notes, // 🔥 BURASI KRİTİK
  },
  'zESrYlGewyvmnHlvx'
)

}
