// Configuration JWT

export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

// Durée du refresh token en millisecondes (pour le cookie)
export const getRefreshTokenMaxAge = (): number => {
  const expiresIn = jwtConfig.refreshExpiresIn;
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // 7 jours par défaut
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
};
