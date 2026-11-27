// Shared by the contact form (index.js) and the MCP server (mcp.js): the
// email plumbing and the small text helpers both need.

export const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Email-safe font stacks (web fonts don't load in mail clients).
export const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
export const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
export const ACCENT = "#da2862";

export const escapeHtml = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Anything interpolated into a mail header has to lose its control characters,
// or a newline in a name turns one header into two. Resend takes JSON rather
// than raw SMTP, so this is belt-and-braces, but the cost is a regex.
export const headerSafe = (s) =>
  String(s)
    // C0 controls and DEL only. Punctuation is left alone, because names
    // have hyphens and apostrophes in them.
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function sendEmail(env, payload) {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return res;
}
