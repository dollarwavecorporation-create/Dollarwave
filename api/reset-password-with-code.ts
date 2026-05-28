import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const IS_PROD = process.env.NODE_ENV === "production";
const logServerError = (ctx: string, err: unknown) => {
  if (err instanceof Error) {
    console.error(`[reset-password-with-code] ${ctx}:`, err);
  } else {
    try {
      console.error(`[reset-password-with-code] ${ctx}:`, JSON.stringify(err));
    } catch {
      console.error(`[reset-password-with-code] ${ctx}:`, String(err));
    }
  }
};

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!hasUpper || !hasLower || !hasSpecial) {
    return "Password must include uppercase, lowercase, and a special character";
  }

  return null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  const code = String(req.body?.code || "").trim();
  const newPassword = String(req.body?.newPassword || "");

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Email, code, and new password are required" });
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return res.status(500).json({ error: "Server misconfiguration: missing supabase config" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  const codeHash = hashCode(code);

  try {
    const { data: resetCode, error: resetLookupError } = await supabase
      .from("password_reset_codes")
      .select("id, user_id")
      .eq("email", email)
      .eq("code_hash", codeHash)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resetLookupError) {
      logServerError('reset-lookup', resetLookupError);
      return res.status(500).json({ error: IS_PROD ? 'Internal server error' : resetLookupError.message });
    }

    if (!resetCode?.id || !resetCode.user_id) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(resetCode.user_id, {
      password: newPassword,
    });

    if (updateAuthError) {
      logServerError('update-auth', updateAuthError);
      return res.status(500).json({ error: IS_PROD ? 'Internal server error' : updateAuthError.message });
    }

    const { error: consumeError } = await supabase
      .from("password_reset_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", resetCode.id);

    if (consumeError) {
      logServerError('consume-code', consumeError);
      return res.status(500).json({ error: IS_PROD ? 'Internal server error' : consumeError.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err: unknown) {
    logServerError('handler', err);
    const message = err instanceof Error ? err.message : "password-reset-failed";
    return res.status(500).json({ error: IS_PROD ? 'password-reset-failed' : message });
  }
}
