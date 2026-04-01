import { supabase } from './supabase'

// Tüm emailler Resend üzerinden (Supabase Edge Function)

const sendEmail = async (type, data) => {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: {
        type,
        data: { ...data, login_url: `${window.location.origin}/giris` },
      },
    })
    if (error) throw error
    return true
  } catch (err) {
    console.warn(`Email gönderilemedi (${type}):`, err)
    return false
  }
}

export const sendQuoteRequest = (form) => {
  return sendEmail('quote_request', {
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
    laminations: form.laminations.join(', '),
    binding: form.binding,
    company: form.company,
    name: form.name,
    email: form.email,
    phone: form.phone,
    notes: form.notes || '-',
  })
}

export const sendWelcomeEmail = ({ email, name, password }) => {
  return sendEmail('welcome', { email, name, password })
}

export const sendStepEmail = ({ email, name, jobNo, jobName, stepName, phaseName, progress }) => {
  return sendEmail('step_update', {
    email,
    name,
    job_no: jobNo,
    job_name: jobName,
    step_name: stepName,
    phase_name: phaseName,
    progress,
  })
}

export const sendJobCompletedEmail = ({ email, name, jobNo, jobName }) => {
  return sendEmail('job_completed', {
    email,
    name,
    job_no: jobNo,
    job_name: jobName,
  })
}
