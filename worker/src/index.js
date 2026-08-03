// Contact-form mailer. A single edge handler: validates the submission, then
// calls Resend's REST API twice: a notification to the site owner (with the
// sender's address as Reply-To, so replying in your inbox goes straight back
// to them) and a confirmation to the sender. No framework, no SDK, no deps.
//
// Serves two forms. /contact/ posts name + email + message. /start/ posts the
// same three plus `formType=brief` and the qualifying fields below, which are
// rendered into the notification as a details block so the reply can quote a
// number instead of asking for one.
//
// Secrets / vars (see wrangler.toml + `wrangler secret put`):
//   RESEND_API_KEY  (secret)  Resend API key
//   TO_EMAIL        (var)     inbox that receives notifications
//   FROM_NOTIFY     (var)     "Name <addr@send.dylancollins.me>" for the notification
//   FROM_CONFIRM    (var)     "Name <addr@send.dylancollins.me>" for the confirmation
//   RATE_LIMITER    (binding, optional) Cloudflare Rate Limiting binding

const ALLOWED_ORIGINS = [
  "https://dylancollins.me",
  "https://www.dylancollins.me",
  "http://localhost:4321",
];

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Email-safe font stacks (web fonts don't load in mail clients).
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
const ACCENT = "#da2862";

const cors = (origin) => {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

const escapeHtml = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Anything interpolated into a mail header has to lose its control characters,
// or a newline in a name turns one header into two. Resend takes JSON rather
// than raw SMTP, so this is belt-and-braces, but the cost is a regex.
const headerSafe = (s) =>
  String(s)
    // C0 controls and DEL only. Punctuation is left alone, because names
    // have hyphens and apostrophes in them.
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Qualifying fields from the /start/ brief, in the order they read best in the
// email. Anything not in this list is ignored, so a new form field can't smuggle
// content into the notification without being added here first.
const BRIEF_FIELDS = [
  ["service", "Service"],
  ["budget", "Budget"],
  ["timeline", "Timeline"],
  ["organisation", "Organisation"],
  ["website", "Website"],
  ["heard", "Found via"],
];

const BRIEF_MAX = 200;

/** Pick the known brief fields that were actually filled in, trimmed and capped. */
function collectBrief(data) {
  return BRIEF_FIELDS.map(([key, label]) => [label, String(data[key] ?? "").trim()])
    .filter(([, value]) => value !== "")
    .map(([label, value]) => [label, value.slice(0, BRIEF_MAX)]);
}

const briefText = (rows) =>
  rows.length ? rows.map(([label, value]) => `${label}: ${value}`).join("\n") + "\n\n" : "";

/** Two-column details block. Table markup, because mail clients still need it. */
const briefHtml = (rows) =>
  rows.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:6px 12px 6px 0;font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6b6b6b;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
            <td style="padding:6px 0;font-size:15px;color:#111111;vertical-align:top">${escapeHtml(value)}</td>
          </tr>`
          )
          .join("")}
      </table>`
    : "";

async function sendEmail(env, payload) {
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

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") ?? "";
    const headers = cors(origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);

    // Per-IP rate limit (graceful no-op if the binding isn't configured).
    if (env.RATE_LIMITER) {
      const ip = request.headers.get("CF-Connecting-IP") ?? "anon";
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return json({ error: "Too many messages. Try again in a minute." }, 429, headers);
      }
    }

    // Accept JSON (the enhanced fetch path) or form-encoded (no-JS fallback).
    let data;
    try {
      const ct = request.headers.get("Content-Type") ?? "";
      if (ct.includes("application/json")) {
        data = await request.json();
      } else {
        data = Object.fromEntries(await request.formData());
      }
    } catch {
      return json({ error: "Could not read submission." }, 400, headers);
    }

    // Honeypot: real users never fill the hidden `company` field. If it's set,
    // silently accept (so the bot thinks it succeeded) and drop the message.
    if (data.company) return json({ ok: true }, 200, headers);

    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim();
    const message = String(data.message ?? "").trim();

    if (!name || !email || !message) {
      return json({ error: "Please fill in name, email, and message." }, 400, headers);
    }
    if (name.length > 100 || email.length > 200 || message.length > 5000) {
      return json({ error: "That's a bit long. Please trim it down." }, 400, headers);
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "That email doesn't look right." }, 400, headers);
    }

    // A brief carries the qualifying fields; a plain contact message doesn't.
    const isBrief = String(data.formType ?? "") === "brief";
    const brief = isBrief ? collectBrief(data) : [];
    const service = isBrief ? String(data.service ?? "").trim().slice(0, BRIEF_MAX) : "";
    const kicker = isBrief ? "New project brief" : "New enquiry";
    const subject = headerSafe(
      isBrief
        ? `New project brief${service ? `: ${service}` : ""} from ${name}`
        : `New enquiry from ${name}`
    );

    // 1) Notification to the owner: Reply-To is the sender, so you reply directly.
    const notify = await sendEmail(env, {
      from: env.FROM_NOTIFY,
      to: [env.TO_EMAIL],
      reply_to: email,
      subject,
      text: `From: ${name} <${email}>\n\n${briefText(brief)}${message}`,
      html: `
        <div style="background:#fafafa;padding:32px 16px;font-family:${SANS}">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5">
            <div style="height:3px;background:${ACCENT}"></div>
            <div style="padding:32px">
              <p style="margin:0 0 24px;font-family:${MONO};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${ACCENT}">${kicker}</p>
              <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111111">${escapeHtml(name)}</p>
              <p style="margin:0 0 24px;font-size:14px"><a href="mailto:${escapeHtml(email)}" style="color:${ACCENT};text-decoration:none">${escapeHtml(email)}</a></p>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 24px" />
              ${briefHtml(brief)}
              <p style="margin:0;font-size:16px;line-height:1.7;color:#333333;white-space:pre-wrap">${escapeHtml(message)}</p>
              <p style="margin:28px 0 0;font-family:${MONO};font-size:11px;letter-spacing:1px;color:#6b6b6b">Reply to this email to respond directly.</p>
            </div>
          </div>
          <p style="max-width:560px;margin:16px auto 0;font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#767676;text-align:center">dylancollins.me</p>
        </div>`,
    });

    if (!notify.ok) {
      const detail = await notify.text().catch(() => "");
      console.error("Resend notification failed:", notify.status, detail);
      return json({ error: "Something went wrong sending your message." }, 502, headers);
    }

    // 2) Confirmation to the sender: best-effort; don't fail the request if it errors.
    ctx.waitUntil(
      sendEmail(env, {
        from: env.FROM_CONFIRM,
        to: [email],
        reply_to: env.TO_EMAIL,
        subject: isBrief ? "Thanks for the brief" : "Thanks for reaching out",
        text: `Hi ${name},\n\n${
          isBrief
            ? "Thanks for sending the brief. I read every one myself, and I'll come back to you within two working days with either some questions or a time to talk."
            : "Thanks for getting in touch. Your message landed and I'll get back to you within a couple of days."
        }\n\nFor reference, here's what you sent:\n\n${briefText(brief)}${message}\n\nDylan`,
        html: `
          <div style="background:#fafafa;padding:32px 16px;font-family:${SANS}">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5">
              <div style="height:3px;background:${ACCENT}"></div>
              <div style="padding:32px">
                <p style="margin:0 0 28px;font-family:${MONO};font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#111111">Dylan Collins<span style="color:${ACCENT}">.</span></p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#333333">Hi ${escapeHtml(name)},</p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#333333">${
                  isBrief
                    ? "Thanks for sending the brief. I read every one myself, and I'll come back to you within two working days with either some questions or a time to talk."
                    : "Thanks for reaching out. Your message landed, and I'll get back to you within a couple of days."
                }</p>
                <p style="margin:0 0 10px;font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6b6b6b">What you sent</p>
                ${briefHtml(brief)}
                <blockquote style="margin:0 0 24px;padding:2px 0 2px 16px;border-left:2px solid ${ACCENT};color:#666666;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</blockquote>
                <p style="margin:0;font-size:16px;line-height:1.7;color:#333333">Dylan</p>
              </div>
            </div>
            <p style="max-width:560px;margin:16px auto 0;font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#767676;text-align:center">dylancollins.me</p>
          </div>`,
      }).catch((e) => console.error("Confirmation email failed:", e))
    );

    return json({ ok: true }, 200, headers);
  },
};
