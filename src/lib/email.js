import emailjs from 'emailjs-com'

export const sendQuoteRequest = (form) => {
  return emailjs.send(
    'service_r38clbw',
    'template_bv6z27k',
    {
      productType: form.productType,
      quantity: form.quantity,
      pageCount: form.pageCount,
      size: form.size,

      innerPaper: form.innerPaper,
      coverPaper: form.coverPaper,

      innerColorFront: form.innerColorFront,
      innerColorBack: form.innerColorBack,
      coverColorFront: form.coverColorFront,
      coverColorBack: form.coverColorBack,

      laminations: form.laminations.join(', '), // 🔥 KRİTİK
      binding: form.binding,

      company: form.company,
      name: form.name,
      email: form.email,
      phone: form.phone,

      notes: form.notes || '-', // boşsa patlamasın
    },
    '7MMTs53h7vjWCtIiT'
  )
}
