export const Constants = {
  // GitHub OAuth
  AUTH_SCOPE: ['read:user', 'notifications', 'repo'],

  DEFAULT_AUTH_OPTIONS: {
    hostname: 'github.com',

    clientId: OAUTH_CLIENT_ID,
    clientSecret: OAUTH_CLIENT_SECRET,
  },

  REPO_SLUG: 'manosim/gitify',

  // Storage
  STORAGE_KEY: 'gitify-storage',

  ALLREAD_EMOJIS: [
    ':wink:',
    ':tada:',
    ':tiger:',
    ':see_no_evil:',
    ':balloon:',
    ':confetti_ball:',
    ':clap:',
    ':circus_tent:',
    ':spaghetti:',
  ],

  ERROR_EMOJIS: [
    ':pensive:',
    ':disappointed:',
    ':triumph:',
    ':scream:',
    ':cry:',
  ],
};

export default Constants;
