/**
 * In-memory token store for access tokens.
 * Avoids persisting tokens to localStorage (XSS risk).
 * Session recovery relies on the httpOnly refresh token cookie.
 */
let currentAccessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => currentAccessToken,
  set: (token: string | null) => {
    currentAccessToken = token;
  },
};
