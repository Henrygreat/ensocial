export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  apiUrl: process.env.API_URL ?? 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.AUTH_SECRET ?? 'change-me-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? process.env.AUTH_SECRET ?? 'change-refresh-secret',
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: `${process.env.API_URL ?? 'http://localhost:3000'}/api/auth/google/callback`,
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    publishableKey: process.env.PUBLIC_STRIPE_KEY ?? '',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY ?? '',
    fromEmail: process.env.EMAIL_FROM ?? 'EnSocial <noreply@ensocial.co>',
  },

  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    bucket: process.env.R2_BUCKET ?? 'ensocial-media',
    publicUrl: process.env.R2_PUBLIC_URL ?? '',
  },

  meilisearch: {
    url: process.env.MEILI_URL ?? 'http://localhost:7700',
    masterKey: process.env.MEILI_MASTER_KEY ?? 'dev_master_key',
  },

  social: {
    facebook: {
      appId: process.env.FACEBOOK_APP_ID ?? '',
      appSecret: process.env.FACEBOOK_APP_SECRET ?? '',
    },
    twitter: {
      apiKey: process.env.TWITTER_API_KEY ?? '',
      apiSecret: process.env.TWITTER_API_SECRET ?? '',
      callbackUrl: `${process.env.API_URL ?? 'http://localhost:3000'}/api/social/callback/twitter`,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID ?? '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
      callbackUrl: `${process.env.API_URL ?? 'http://localhost:3000'}/api/social/callback/linkedin`,
    },
    tiktok: {
      clientKey: process.env.TIKTOK_CLIENT_KEY ?? '',
      clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? '',
    },
    pinterest: {
      appId: process.env.PINTEREST_APP_ID ?? '',
      appSecret: process.env.PINTEREST_APP_SECRET ?? '',
    },
  },
});
