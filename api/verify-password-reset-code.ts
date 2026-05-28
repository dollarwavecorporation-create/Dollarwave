import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

const IS_PROD = process.env.NODE_ENV === "production";
const logServerError = (ctx: string, err: unknown) => {
  if (err instanceof Error) {
    console.error(`[verify-password-reset-code] ${ctx}:`, err);
  } else {
    try {
      console.error(`[verify-password-reset-code] ${ctx}:`, JSON.stringify(err));
    } catch {
      console.error(`[verify-password-reset-code] ${ctx}:`, String(err));
    }
  }
};

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  const code = String(req.body?.code || "").trim();

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return res.status(500).json({ error: "Server misconfiguration: missing supabase config" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  const codeHash = hashCode(code);

  try {
    const { data, error } = await supabase
      .from("password_reset_codes")
      .select("id")
      .eq("email", email)
      .eq("code_hash", codeHash)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logServerError('lookup', error);
      return res.status(500).json({ error: IS_PROD ? 'Internal server error' : error.message });
    }

    if (!data?.id) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    return res.status(200).json({ ok: true });
  } catch (err: unknown) {
    logServerError('handler', err);
    const message = err instanceof Error ? err.message : "verification-failed";
    return res.status(500).json({ error: IS_PROD ? 'verification-failed' : message });
  }
}
