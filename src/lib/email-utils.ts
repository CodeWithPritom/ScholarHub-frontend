/**
 * ScholarHub AI — Enterprise Email Utilities & Validation Engine
 * Supports Node.js runtime, Edge Functions, and frontend validation.
 */

// RFC 5322 Compliant Email Regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const URL_REGEX = /(https?:\/\/[^\s<>'"`]+)/g;

/**
 * Strict email validation helper.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Normalizes email address to lowercase and stripped whitespace.
 */
export function formatEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Escapes HTML entities to prevent Cross-Site Scripting (XSS).
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Automatically converts raw plain-text URLs into clickable anchor tags
 * while securely escaping all other HTML characters.
 */
export function autoLinkText(plainText: string): string {
  if (!plainText) return '';
  const escaped = escapeHtml(plainText);

  // Auto-link URLs
  const linked = escaped.replace(URL_REGEX, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #4f46e5; font-weight: 600; text-decoration: underline;">${url}</a>`;
  });

  // Paragraph wrapping
  const paragraphs = linked.split('\n\n');
  return paragraphs
    .filter(p => p.trim())
    .map(p => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #334155;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export interface EmailTemplateOptions {
  subject: string;
  body: string;
  badgeTitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  recipientName?: string;
  recipientTier?: string;
  portalUrl?: string;
}

/**
 * Generates bulletproof, responsive HTML email layout for Gmail, Outlook, Apple Mail.
 */
export function generateResponsiveEmailHtml(options: EmailTemplateOptions): string {
  const currentYear = new Date().getFullYear();
  const portalUrl = options.portalUrl || 'https://scholarhub-ai.com';
  const recipientName = options.recipientName || 'Researcher';
  const recipientTier = options.recipientTier ? (options.recipientTier.charAt(0).toUpperCase() + options.recipientTier.slice(1)) : 'Member';
  const badgeTitle = options.badgeTitle || 'Official Announcement';
  const targetCtaUrl = options.ctaUrl || portalUrl;
  const targetCtaText = options.ctaText || 'Open ScholarHub AI';

  // Dynamic variable replacement
  let resolvedBody = options.body
    .replace(/\{\{name\}\}/g, recipientName)
    .replace(/\{\{tier\}\}/g, recipientTier)
    .replace(/\{\{year\}\}/g, String(currentYear))
    .replace(/\{\{portal_url\}\}/g, portalUrl);

  const formattedBodyHtml = autoLinkText(resolvedBody);

  const ctaButtonHtml = options.ctaText ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 20px 0;">
        <tr>
            <td align="center" style="border-radius: 12px; background: #4f46e5;">
                <a href="${targetCtaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); letter-spacing: 0.025em; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                    ${escapeHtml(targetCtaText)} &rarr;
                </a>
            </td>
        </tr>
    </table>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.subject)}</title>
    <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; padding: 12px !important; }
            .content-padding { padding: 24px 20px !important; }
            .header-padding { padding: 28px 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
    <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${escapeHtml(options.subject)} — ScholarHub AI Global Research Platform.
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 30px 10px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                    
                    <tr>
                        <td align="left" class="header-padding" style="padding: 36px 36px 28px 36px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%); border-bottom: 2px solid #4f46e5;">
                            <div style="display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.25); border: 1px solid rgba(165, 180, 252, 0.4); border-radius: 9999px; margin-bottom: 12px;">
                                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #c7d2fe;">
                                    ${escapeHtml(badgeTitle)}
                                </span>
                            </div>
                            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; line-height: 1.3;">
                                ScholarHub <span style="color: #818cf8;">AI</span>
                            </h1>
                            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                                The Global Academic Research &amp; Intelligence Ecosystem
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td class="content-padding" style="padding: 36px 36px 28px 36px; background-color: #ffffff;">
                            <p style="margin: 0 0 18px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
                                Hello ${escapeHtml(recipientName)},
                            </p>
                            <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 800; color: #1e293b; line-height: 1.4;">
                                ${escapeHtml(options.subject)}
                            </h2>
                            <div style="font-size: 15px; line-height: 1.65; color: #334155;">
                                ${formattedBodyHtml}
                            </div>
                            ${ctaButtonHtml}
                            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #475569;">
                                    Warm regards,
                                </p>
                                <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 800; color: #0f172a;">
                                    ScholarHub AI Operations Team
                                </p>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">
                                You received this notification because your account is registered on ScholarHub AI.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                &copy; ${currentYear} ScholarHub AI. All global rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
