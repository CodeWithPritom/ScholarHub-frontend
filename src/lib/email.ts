/**
 * ScholarHub AI — Nodemailer SMTP Gateway
 * Configured for Node.js environments / Server Actions / Microservices.
 */

import { generateResponsiveEmailHtml, isValidEmail, formatEmail, EmailTemplateOptions } from './email-utils';

export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  fromName?: string;
  fromEmail?: string;
}

export function getSmtpConfig(): SmtpConfig {
  const gProcess = (globalThis as any).process;
  const env: any = (gProcess && gProcess.env) ? gProcess.env : {};
  return {
    host: env.SMTP_HOST || env.SMTP_SERVER || 'smtp.gmail.com',
    port: parseInt(env.SMTP_PORT || '587', 10),
    user: env.SMTP_USER || env.SMTP_USERNAME || '',
    pass: env.SMTP_PASS || env.SMTP_PASSWORD || '',
    fromName: env.SMTP_FROM_NAME || 'ScholarHub AI',
    fromEmail: env.SMTP_FROM_EMAIL || 'admin@scholarhub-ai.com'
  };
}

export function formatSenderIdentity(fromName?: string, fromEmail?: string): string {
  const name = fromName || 'ScholarHub AI';
  const email = fromEmail || 'admin@scholarhub-ai.com';
  return `"${name}" <${email}>`;
}

/**
 * Creates a Nodemailer transporter instance if nodemailer is present in the environment.
 */
export async function createSmtpTransporter() {
  const config = getSmtpConfig();
  try {
    // Dynamic import with ignore so bundlers/lint do not require local module
    // @ts-ignore
    const nodemailer = await import(/* @vite-ignore */ 'nodemailer');
    return (nodemailer.default || nodemailer).createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: config.user ? { user: config.user, pass: config.pass } : undefined
    });
  } catch (err) {
    console.warn('[SMTP Gateway] Nodemailer not available in current environment:', err);
    return null;
  }
}

/**
 * Sends a single email using Nodemailer with responsive HTML template.
 */
export async function sendEmailWithNodemailer(
  recipient: string,
  options: EmailTemplateOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const cleanEmail = formatEmail(recipient);
  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: 'Invalid recipient email address' };
  }

  const config = getSmtpConfig();
  const transporter = await createSmtpTransporter();
  if (!transporter) {
    return { success: false, error: 'SMTP Transporter could not be initialized' };
  }

  const html = generateResponsiveEmailHtml(options);
  const plainText = `${options.subject}\n\n${options.body}\n\nScholarHub AI Team`;

  try {
    const info = await transporter.sendMail({
      from: formatSenderIdentity(config.fromName, config.fromEmail),
      to: cleanEmail,
      subject: options.subject,
      text: plainText,
      html: html
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    return { success: false, error: err?.message || 'SMTP dispatch error' };
  }
}
