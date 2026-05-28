import nodemailer from "nodemailer";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email, amount, source, wallet } = req.body || {};
  if (!email) {
    res.status(400).json({ error: "Missing email" });
    return;
  }

  const EMAIL_HOST = process.env.EMAIL_HOST;
  const EMAIL_PORT = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASS = process.env.EMAIL_PASS;
  const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

  const getTransporter = () => {
    if (EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS) {
      return nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_PORT === 465,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });
    }

    if (EMAIL_USER && EMAIL_PASS) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });
    }

    return null;
  };

  const transporter = getTransporter();
  if (!transporter || !EMAIL_FROM) {
    res.status(500).json({ error: "Email configuration missing on the server" });
    return;
  }

  try {
    const SITE_URL = process.env.BASE_ADDRESS || process.env.SUPABASE_URL || "https://dollarwave.com";
    const LOGO_URL =
      process.env.EMAIL_LOGO_URL ||
      "https://blxgeghylfajgxrtaoim.supabase.co/storage/v1/object/sign/ofiicial_images/favicon.ico?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjVjNzIzYy0xYzRhLTQ4NTktYWY3My1mZmY5MzI3ZjliNzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJvZmlpY2lhbF9pbWFnZXMvZmF2aWNvbi5pY28iLCJpYXQiOjE3NzkyNjQ3NjUsImV4cCI6MTkzNjk0NDc2NX0.djnyQ77P3B0APP0ogu4Erijz2QtHAQah339HRimIV7c";

    const formattedAmount = typeof amount === "number" ? amount.toFixed(2) : String(amount);
    const createdAt = new Date().toLocaleString();
    const reference = req.body?.reference || `WD-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    const subject = `DollarWave — Withdrawal Request ${reference} (Pending)`;

    // Try to read fee percent from app_settings in the database (service role required), fallback to env or 5%
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
    let feePercent = 0.05;
    try {
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
        const { data } = await supabase.from('app_settings').select('value').eq('key', 'withdrawal_fee_percent').maybeSingle();
        if (data?.value) {
          const parsed = Number(data.value);
          if (!Number.isNaN(parsed)) feePercent = parsed;
        }
      } else if (process.env.WITHDRAWAL_FEE_PERCENT) {
        const parsed = Number(process.env.WITHDRAWAL_FEE_PERCENT);
        if (!Number.isNaN(parsed)) feePercent = parsed;
      }
    } catch (err) {
      // ignore and use default
    }

    const feeAmount = Math.round((Number(amount) * feePercent + Number.EPSILON) * 100) / 100;
    const netAmount = Math.round((Number(amount) - feeAmount + Number.EPSILON) * 100) / 100;

    const text = `We received your withdrawal request of $${formattedAmount} from ${source}.\n\nWallet: ${wallet}\nReference: ${reference}\nFee: $${feeAmount} (${(feePercent * 100).toFixed(2)}%)\nAmount to be sent: $${netAmount}\nStatus: Pending\nProcessing may take 4-7 business days. We'll notify you when it's processed.`;

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Withdrawal Request</title>
      </head>
      <body style="margin:0;padding:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding:28px 16px;">
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e9ecef;box-shadow:0 6px 20px rgba(15,23,42,0.04);">
                <tr><td style="height:6px;background:linear-gradient(90deg,#b8860b,#f5c75a);line-height:6px;padding:0;margin:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:20px 28px 4px;display:flex;align-items:center;gap:12px;">
                    <img src="${LOGO_URL}" alt="DollarWave" width="40" height="40" style="display:block;width:40px;height:40px;border-radius:6px;object-fit:cover;"/>
                    <div style="font-weight:800;font-size:22px;color:#b8860b;letter-spacing:0.2px;">DollarWave</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px 24px;">
                    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Withdrawal Request Received</h1>
                    <p style="margin:0 0 12px;color:#475569;line-height:1.45">We've received your withdrawal request and it's currently <strong>Pending</strong>. Processing typically takes <strong>4-7 business days</strong>.</p>
                    <table style="width:100%;margin-top:12px;border-collapse:collapse;font-size:14px;color:#0f172a;">
                      <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;width:160px;color:#64748b">Reference</td><td style="padding:8px 0;border-bottom:1px solid #eef2f7">${reference}</td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;color:#64748b">Amount</td><td style="padding:8px 0;border-bottom:1px solid #eef2f7">$${formattedAmount}</td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;color:#64748b">Source</td><td style="padding:8px 0;border-bottom:1px solid #eef2f7">${source}</td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;color:#64748b">Wallet</td><td style="padding:8px 0;border-bottom:1px solid #eef2f7">${wallet}</td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;color:#64748b">Fee (${(feePercent*100).toFixed(2)}%)</td><td style="padding:8px 0;border-bottom:1px solid #eef2f7">$${feeAmount.toFixed(2)}</td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;color:#64748b">Amount to be sent</td><td style="padding:8px 0;border-bottom:1px solid #eef2f7">$${netAmount.toFixed(2)}</td></tr>
                      <tr><td style="padding:8px 0;color:#64748b">Requested at</td><td style="padding:8px 0">${createdAt}</td></tr>
                    </table>

                    <p style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.45">If you did not request this withdrawal, contact support immediately: <a href="mailto:support@dollarwave.com" style="color:#0369a1;text-decoration:underline">support@dollarwave.com</a>.</p>
                    <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">This message was sent to <strong>${email}</strong> from <a href="${SITE_URL}" style="color:#0369a1;text-decoration:underline">${SITE_URL}</a>.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

    await transporter.sendMail({ from: EMAIL_FROM, to: email, subject, text, html });
    res.status(200).json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "send-failed";
    res.status(500).json({ error: message });
  }
}
