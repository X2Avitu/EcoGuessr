import "server-only";

function appOrigin(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
): Promise<{ ok: boolean; devLink?: string; error?: string }> {
  const link = `${appOrigin()}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const html = `
    <p>You asked to reset your Platz password.</p>
    <p><a href="${link}">Reset your password</a></p>
    <p>If you did not request this, ignore this email.</p>
  `.trim();

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Platz <onboarding@resend.dev>";

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: "Reset your Platz password",
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return { ok: false, error: err };
      }
      return { ok: true };
    } catch (e: unknown) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Resend request failed",
      };
    }
  }

  console.info("[Platz] Password reset (no RESEND_API_KEY):", { to, link });
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, devLink: link };
  }
  return {
    ok: false,
    error:
      "Email not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to send reset emails.",
  };
}
