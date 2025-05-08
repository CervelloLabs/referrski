import { Resend } from 'resend';

// Create the Resend client lazily when needed
let resend: Resend | null = null;

interface SendEmailOptions {
  to: string;
  fromName: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, fromName, subject, html, replyTo }: SendEmailOptions) {
  try {
    // Check for environment variables when the function is called
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error('Missing RESEND_FROM_EMAIL environment variable');
    }

    // Initialize Resend client if not already done
    if (!resend) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }

    const defaultFromEmail = process.env.RESEND_FROM_EMAIL;

    // Validate email format
    if (!to.includes('@')) {
      throw new Error('Invalid recipient email address');
    }

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${defaultFromEmail}>`,
      to: [to],
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
} 