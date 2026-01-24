export const CONFIG = {
  URL_KEYWORD: "fiverr.com",
  STORAGE_KEY_PREFIX: "fiverr_refresh_",
  TIMING: {
    NIGHT_START: 0,
    NIGHT_END: 6,
    BASE_DELAY_MS: 240000,
    RANDOM_ADDITION_MS: 15000,
    NIGHT_MIN_MS: 60000,
    NIGHT_MAX_MS: 90000,
  },
  NAV_URLS: [
    "https://www.fiverr.com/seller_dashboard",
    "https://www.fiverr.com/earnings",
    "https://www.fiverr.com/briefs/overview/matches",
    "https://www.fiverr.com/referral_program",
    "https://www.fiverr.com/inbox"
  ],
  INBOX_URL: "https://www.fiverr.com/inbox",
  INBOX_PRIORITY_INTERVAL_MS: 120000 // 2 minutes
};

