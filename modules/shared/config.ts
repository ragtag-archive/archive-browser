export const DRIVE_BASE_URL = "https://archive-content.ragtag.moe";
export const ES_INDEX = "youtube-archive";
export const ES_BACKEND_URL = process.env.ES_BACKEND_URL;
export const ES_BASIC_USERNAME = process.env.ES_BASIC_USERNAME;
export const ES_BASIC_PASSWORD = process.env.ES_BASIC_PASSWORD;
export const TASQ_QUEUE_URL = process.env.TASQ_QUEUE_URL;

export const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY;
export const NEXT_PUBLIC_HCAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export const JWT_PUBLIC_KEY =
  "-----BEGIN PUBLIC KEY-----\n" +
  process.env.JWT_PUBLIC_KEY +
  "\n-----END PUBLIC KEY-----";
export const BULK_INSERT_ROLE = process.env.BULK_INSERT_ROLE;
