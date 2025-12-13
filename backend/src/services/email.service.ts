import { Resend } from 'resend';
import { emailConfig, emailTemplates } from '../config/email.config';

// Instance Resend (initialisée seulement si la clé API est configurée)
let resend: Resend | null = null;

const getResendClient = (): Resend | null => {
  if (!emailConfig.resendApiKey) {
    console.warn('[Email] Resend API key not configured. Emails will be logged to console.');
    return null;
  }
  if (!resend) {
    resend = new Resend(emailConfig.resendApiKey);
  }
  return resend;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Service d'envoi d'emails
 */
export class EmailService {
  /**
   * Envoie un email
   */
  private static async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const client = getResendClient();

    if (!client) {
      // Mode développement: log l'email dans la console
      console.log('\n========== EMAIL (DEV MODE) ==========');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body:\n${options.html.replace(/<[^>]*>/g, '')}`);
      console.log('=======================================\n');
      return true;
    }

    try {
      const result = await client.emails.send({
        from: emailConfig.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (result.error) {
        console.error('[Email] Failed to send email:', result.error);
        return false;
      }

      console.log(`[Email] Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('[Email] Error sending email:', error);
      return false;
    }
  }

  /**
   * Envoie un email de vérification d'adresse email
   */
  static async sendVerificationEmail(
    email: string,
    token: string,
    firstName?: string
  ): Promise<boolean> {
    const verificationUrl = `${emailConfig.frontendUrl}/verify-email/${token}`;

    return this.sendEmail({
      to: email,
      subject: emailTemplates.verification.subject,
      html: emailTemplates.verification.getBody(verificationUrl, firstName),
    });
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  static async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName?: string
  ): Promise<boolean> {
    const resetUrl = `${emailConfig.frontendUrl}/reset-password/${token}`;

    return this.sendEmail({
      to: email,
      subject: emailTemplates.passwordReset.subject,
      html: emailTemplates.passwordReset.getBody(resetUrl, firstName),
    });
  }

  /**
   * Envoie un email de bienvenue (après vérification)
   */
  static async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: emailTemplates.welcome.subject,
      html: emailTemplates.welcome.getBody(firstName),
    });
  }
}
