import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash, randomInt } from "crypto";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const IS_PROD = process.env.NODE_ENV === "production";
const logServerError = (ctx: string, err: unknown) => {
  if (err instanceof Error) {
    console.error(`[request-password-reset] ${ctx}:`, err);
  } else {
    try {
      console.error(`[request-password-reset] ${ctx}:`, JSON.stringify(err));
    } catch {
      console.error(`[request-password-reset] ${ctx}:`, String(err));
    }
  }
};

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

const genericOkMessage =
  "If this email is registered, a 6-digit reset code has been sent.";

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return res.status(500).json({ error: "Server misconfiguration: missing supabase config" });
  }

  const transporter = getTransporter();
  if (!transporter || !EMAIL_FROM) {
    return res.status(500).json({ error: "Email configuration missing on the server" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (profileError) {
      logServerError('profile-lookup', profileError);
      return res.status(500).json({ error: IS_PROD ? 'Internal server error' : profileError.message });
    }

    if (!profile?.user_id) {
      return res.status(200).json({ ok: true, message: genericOkMessage });
    }

    const code = String(randomInt(0, 1000000)).padStart(6, "0");
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase
      .from("password_reset_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("user_id", profile.user_id)
      .is("consumed_at", null);

    const { error: insertError } = await supabase.from("password_reset_codes").insert({
      user_id: profile.user_id,
      email: normalizedEmail,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    if (insertError) {
      logServerError('insert-password-reset', insertError);
      return res.status(500).json({ error: IS_PROD ? 'Internal server error' : insertError.message });
    }

    const SITE_URL = process.env.BASE_ADDRESS || SUPABASE_URL || "https://dollarwave.com";
    const LOGO_URL =
      process.env.EMAIL_LOGO_URL ||
      "https://blxgeghylfajgxrtaoim.supabase.co/storage/v1/object/sign/ofiicial_images/favicon.ico?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjVjNzIzYy0xYzRhLTQ4NTktYWY3My1mZmY5MzI3ZjliNzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJvZmlpY2lhbF9pbWFnZXMvZmF2aWNvbi5pY28iLCJpYXQiOjE3NzkyNjQ3NjUsImV4cCI6MTkzNjk0NDc2NX0.djnyQ77P3B0APP0ogu4Erijz2QtHAQah339HRimIV7c";

    const subject = "DollarWave — Password reset code";
    const text = `Your DollarWave password reset code: ${code}\nThis code expires in 15 minutes.`;

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Password reset</title>
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
                    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Password reset code</h1>
                    <p style="margin:0 0 12px;color:#475569;line-height:1.45">A password reset was requested for your DollarWave account. Use the code below to continue.</p>
                    <div style="margin:12px 0 18px;padding:14px 18px;background:#f1f5f9;border-radius:10px;display:inline-block;">
                      <span style="font-family:monospace;font-size:28px;font-weight:800;letter-spacing:6px;color:#0f172a">${code}</span>
                    </div>
                    <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.45">This code will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this message or contact support.</p>
                    <p style="margin:12px 0 0;color:#64748b;font-size:13px;line-height:1.45">Need help? Email <a href="mailto:support@dollarwave.com" style="color:#0369a1;text-decoration:underline">support@dollarwave.com</a>.</p>
                    <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">This message was sent to <strong>${normalizedEmail}</strong> from <a href="${SITE_URL}" style="color:#0369a1;text-decoration:underline">${SITE_URL}</a>.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: normalizedEmail,
      subject,
      text,
      html,
    });

    return res.status(200).json({ ok: true, message: genericOkMessage });
  } catch (err: unknown) {
    logServerError('handler', err);
    const message = err instanceof Error ? err.message : "request-failed";
    return res.status(500).json({ error: IS_PROD ? 'request-failed' : message });
  }
}
