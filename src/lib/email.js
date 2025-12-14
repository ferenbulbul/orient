export async function sendQuoteRequest(formData) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS environment variables are missing')
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      productType: formData.productType,
      quantity: formData.quantity,
      pageCount: formData.pageCount,
      size: formData.size,
      paper: formData.paper,
      color: formData.color,
      binding: formData.binding,
      sample: formData.sample,
      notes: formData.notes,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    },
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('EmailJS request failed')
  }
}
