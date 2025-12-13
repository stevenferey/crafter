// Configuration Email (Resend)

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@crafter.app',
  resendApiKey: process.env.RESEND_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Templates pour les emails
export const emailTemplates = {
  verification: {
    subject: 'Vérifiez votre adresse email - Crafter',
    getBody: (verificationUrl: string, firstName?: string): string => `
      <h1>Bienvenue sur Crafter${firstName ? `, ${firstName}` : ''} !</h1>
      <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
      <p><a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Vérifier mon email</a></p>
      <p>Ce lien expire dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
      <p>Cordialement,<br>L'équipe Crafter</p>
    `,
  },
  passwordReset: {
    subject: 'Réinitialisation de votre mot de passe - Crafter',
    getBody: (resetUrl: string, firstName?: string): string => `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Bonjour${firstName ? ` ${firstName}` : ''},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.</p>
      <p>Cordialement,<br>L'équipe Crafter</p>
    `,
  },
  welcome: {
    subject: 'Bienvenue sur Crafter !',
    getBody: (firstName?: string): string => `
      <h1>Bienvenue sur Crafter${firstName ? `, ${firstName}` : ''} !</h1>
      <p>Votre compte a été créé avec succès et votre email est maintenant vérifié.</p>
      <p>Vous pouvez maintenant :</p>
      <ul>
        <li>Créer vos entreprises clientes et prestataires</li>
        <li>Générer des CRA (Comptes Rendus d'Activité)</li>
        <li>Exporter vos CRA au format PDF</li>
      </ul>
      <p>Cordialement,<br>L'équipe Crafter</p>
    `,
  },
};
