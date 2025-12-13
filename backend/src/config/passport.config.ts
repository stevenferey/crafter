import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { UserModel } from '../models/user.model.js';

/**
 * Configuration de Passport pour l'authentification OAuth
 */
export function configurePassport(): void {
  // Vérifier que les variables d'environnement sont définies
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('[Passport] Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return;
  }

  // Configuration de la stratégie Google
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (error: Error | null, user?: Express.User | false) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('Email non fourni par Google'));
          }

          // Chercher un utilisateur existant par Google ID
          let user = await UserModel.findByGoogleId(profile.id);

          if (user) {
            // Utilisateur existant avec ce Google ID
            return done(null, user);
          }

          // Chercher un utilisateur existant par email
          user = await UserModel.findByEmail(email);

          if (user) {
            // Lier le compte Google à l'utilisateur existant
            await UserModel.linkGoogleAccount(
              user.id,
              profile.id,
              profile.photos?.[0]?.value
            );
            // Recharger l'utilisateur mis à jour
            user = await UserModel.findById(user.id);
            return done(null, user || false);
          }

          // Créer un nouvel utilisateur
          user = await UserModel.createFromGoogle({
            email,
            google_id: profile.id,
            first_name: profile.name?.givenName,
            last_name: profile.name?.familyName,
            avatar_url: profile.photos?.[0]?.value,
          });

          console.log(`[Passport] New user created via Google: ${email}`);

          return done(null, user);
        } catch (error) {
          console.error('[Passport] Google strategy error:', error);
          return done(error as Error);
        }
      }
    )
  );

  // Passport n'utilise pas de sessions dans notre cas (JWT), mais ces méthodes sont nécessaires
  passport.serializeUser((user, done) => {
    done(null, (user as Express.User & { id: string }).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  console.log('[Passport] Google OAuth strategy configured');
}
