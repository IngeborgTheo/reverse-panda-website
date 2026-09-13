/**
 * Optional Cloudflare Worker for website feedback.
 * Deploy separately. Set secrets: RESEND_API_KEY
 * Env vars: RESEND_FROM, SUPPORT_TO (default support@reverse-panda.ch)
 *
 * Point live/feedback-config.js `endpoint` at this Worker URL.
 * Do not put API keys in the website frontend.
 */

const ALLOWED_ORIGINS = new Set([
  "https://reverse-panda.ch",
  "https://www.reverse-panda.ch"
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://reverse-panda.ch";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

function json(status, body, request, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
      ...extraHeaders
    }
  });
}

function trim(value) {
  return String(value || "").trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmail(payload) {
  const type = payload.type;
  const subjectMap = {
    bug: "ReversePanda website — Bug report",
    feature: "ReversePanda website — Feature request",
    hello: "ReversePanda website — Hello"
  };

  const lines = [
    `Source: ${payload.source || "website"}`,
    `Type: ${type}`,
    ""
  ];

  if (type === "hello") {
    lines.push(`Name: ${payload.name || "—"}`);
    lines.push(`Email: ${payload.email}`);
    lines.push("", "Message:", payload.message);
  } else if (type === "bug") {
    lines.push(`Email: ${payload.email || "—"}`);
    lines.push(`Android version: ${payload.androidVersion || "—"}`);
    lines.push(`Device model: ${payload.device || "—"}`);
    lines.push("", "What happened:", payload.happened);
    if (payload.expected) lines.push("", "What did you expect:", payload.expected);
  } else if (type === "feature") {
    lines.push(`Email: ${payload.email || "—"}`);
    lines.push(`Title: ${payload.featureTitle}`);
    lines.push(`Category: ${payload.category || "—"}`);
    lines.push("", "About:", payload.featureAbout);
    if (payload.why) lines.push("", "Why useful:", payload.why);
  }

  const text = lines.join("\n");
  const html = `<pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
  return { subject: subjectMap[type] || subjectMap.hello, text, html };
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") return "Invalid payload.";
  if (trim(payload.company)) return "Rejected.";

  const type = payload.type;
  if (!["bug", "feature", "hello"].includes(type)) return "Unknown feedback type.";

  const email = trim(payload.email);
  if (email) {
    if (email.length > 254 || !isValidEmail(email)) return "Invalid email.";
  } else if (type === "hello") {
    return "Email is required.";
  }

  if (type === "hello") {
    const message = trim(payload.message);
    if (!message || message.length > 2000) return "Invalid message.";
  }

  if (type === "bug") {
    const happened = trim(payload.happened);
    if (!happened || happened.length > 2000) return "Invalid bug description.";
    if (trim(payload.expected).length > 1500) return "Expected behaviour is too long.";
  }

  if (type === "feature") {
    const title = trim(payload.featureTitle);
    const about = trim(payload.featureAbout);
    if (!title || title.length > 100) return "Invalid feature title.";
    if (!about || about.length > 2000) return "Invalid feature description.";
    if (trim(payload.why).length > 1000) return "Usefulness note is too long.";
  }

  if (payload.screenshot) {
    if (type !== "bug") return "Screenshots are only allowed for bug reports.";
    const shot = payload.screenshot;
    if (!shot.type || !String(shot.type).startsWith("image/")) return "Invalid screenshot type.";
    if (!shot.dataBase64 || typeof shot.dataBase64 !== "string") return "Invalid screenshot data.";
    const approxBytes = Math.floor((shot.dataBase64.length * 3) / 4);
    if (approxBytes > MAX_SCREENSHOT_BYTES) return "Screenshot exceeds 5 MB.";
  }

  return null;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== "POST") {
      return json(405, { error: "Method not allowed." }, request);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(400, { error: "Invalid JSON." }, request);
    }

    const validationError = validatePayload(payload);
    if (validationError) return json(400, { error: validationError }, request);

    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) return json(500, { error: "Mail service is not configured." }, request);

    const to = env.SUPPORT_TO || "support@reverse-panda.ch";
    const from = env.RESEND_FROM || "ReversePanda <noreply@reverse-panda.ch>";
    const email = buildEmail(payload);

    const attachments = [];
    if (payload.screenshot && payload.screenshot.dataBase64) {
      attachments.push({
        filename: payload.screenshot.name || "screenshot.jpg",
        content: payload.screenshot.dataBase64
      });
    }

    const resendBody = {
      from,
      to: [to],
      subject: email.subject,
      text: email.text,
      html: email.html,
      reply_to: trim(payload.email) || undefined,
      attachments: attachments.length ? attachments : undefined
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(resendBody)
    });

    if (!resendResponse.ok) {
      return json(502, { error: "Could not deliver message." }, request);
    }

    return json(200, { ok: true }, request);
  }
};
