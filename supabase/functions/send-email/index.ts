import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "EuromatPrint <bilgi@euromatprint.com>";
const QUOTE_TO = "m.polat@euromatprint.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email HTML template
function buildHTML(toName: string, message: string, highlight: string, subHighlight: string, buttonText: string, buttonUrl: string) {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #0f172a; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 20px;">EuromatPrint</h1>
  </div>
  <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 32px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; color: #1e293b;">Sayın <strong>${toName}</strong>,</p>
    <p style="font-size: 14px; color: #475569;">${message}</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 18px; font-weight: bold; color: #15803d; margin: 0;">${highlight}</p>
      ${subHighlight ? `<p style="font-size: 13px; color: #16a34a; margin: 8px 0 0;">${subHighlight}</p>` : ""}
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${buttonUrl}" style="background: #0f172a; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">${buttonText}</a>
    </div>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; text-align: center;">Bu e-posta EuromatPrint iş takip sistemi tarafından otomatik gönderilmiştir.</p>
  </div>
</div>`;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    let to: string;
    let subject: string;
    let html: string;

    const loginUrl = data.login_url || "https://euromatprint.com/giris";

    switch (type) {
      case "welcome": {
        to = data.email;
        subject = "EuromatPrint - Hesabınız oluşturuldu";
        html = buildHTML(
          data.name,
          "EuromatPrint iş takip sistemine hesabınız oluşturulmuştur. Giriş bilgileriniz:",
          `E-posta: ${data.email}`,
          `Şifre: ${data.password} — Lütfen giriş yaptıktan sonra şifrenizi değiştirin.`,
          "Giriş Yap",
          loginUrl
        );
        break;
      }

      case "binding_completed": {
        // Çoklu alıcı desteği: data.emails array veya data.email tekil
        to = data.emails || data.email;
        subject = `${data.job_no} nolu işiniz tamamlanmıştır`;
        html = buildHTML(
          data.name,
          `<strong>${data.job_no}</strong> nolu işiniz tamamlanmıştır, sevkiyat beklemektedir.`,
          `${data.job_no} nolu işiniz tamamlanmıştır`,
          "Sevkiyat beklemektedir",
          "Detayları Görüntüle",
          loginUrl
        );
        break;
      }

      case "quote_request": {
        to = QUOTE_TO;
        subject = `Yeni Teklif Talebi - ${data.name} (${data.company || "Firma belirtilmedi"})`;
        html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #e11d48; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 20px;">Yeni Teklif Talebi</h1>
  </div>
  <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 32px; border-radius: 0 0 12px 12px;">
    <h3 style="color: #1e293b; margin-top: 0;">İletişim Bilgileri</h3>
    <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; font-weight: 600;">Ad Soyad:</td><td>${data.name}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Firma:</td><td>${data.company || "-"}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">E-posta:</td><td>${data.email}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Telefon:</td><td>${data.phone}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <h3 style="color: #1e293b;">Ürün Detayları</h3>
    <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; font-weight: 600;">Ürün:</td><td>${data.productType}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Adet:</td><td>${data.quantity}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Sayfa Sayısı:</td><td>${data.pageCount}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Ölçü:</td><td>${data.size}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <h3 style="color: #1e293b;">Teknik Detaylar</h3>
    <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; font-weight: 600;">İç Kağıt:</td><td>${data.innerPaper}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Kapak Kağıdı:</td><td>${data.coverPaper}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">İç Renk (Ön/Arka):</td><td>${data.innerColorFront || "-"} / ${data.innerColorBack || "-"}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Kapak Renk (Ön/Arka):</td><td>${data.coverColorFront || "-"} / ${data.coverColorBack || "-"}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Laminasyon:</td><td>${data.laminations || "-"}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Cilt:</td><td>${data.binding}</td></tr>
    </table>
    ${data.notes ? `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"><h3 style="color: #1e293b;">Notlar</h3><p style="font-size: 14px; color: #475569;">${data.notes}</p>` : ""}
  </div>
</div>`;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown email type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: Array.isArray(to) ? to : [to], subject, html }),
    });

    const result = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: result }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
