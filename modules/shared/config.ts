/**
 * Database configuration
 * Elasticsearch 7.11
 *
 * ES_INDEX - primary index where video data is stored
 * ES_INDEX_SEARCH_LOG - index where searches are logged
 * ES_INDEX_PAGE_VIEWS - track video and channel page views
 * ES_BACKEND_URL - endpoint
 * ES_AUTHORIZATION - authorization header (e.g. "Basic bmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXA=")
 */
export const ES_INDEX = process.env.ES_INDEX || 'youtube-archive';
export const ES_INDEX_SEARCH_LOG =
  process.env.ES_INDEX_SEARCH_LOG || 'youtube-archive-searches';
export const ES_INDEX_PAGE_VIEWS =
  process.env.ES_INDEX_PAGE_VIEWS || 'youtube-archive-page-views';
export const ES_BACKEND_URL =
  process.env.ES_BACKEND_URL || 'http://127.0.0.1:9200';
export const ES_AUTHORIZATION = process.env.ES_AUTHORIZATION || '';

/**
 * Image optimization, defaults to false
 */
export const ENABLE_IMAGE_OPTIMIZATION = process.env
  .NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION
  ? process.env.NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION === 'true'
  : false;

/**
 * Raid mode - selectively disable features
 * ENABLE_RAID_MODE - enable raid mode
 * RAID_MODE_ALLOW_VIDEO_PLAYBACK - enable video playback during raid mode
 */
export const ENABLE_RAID_MODE = process.env.ENABLE_RAID_MODE
  ? process.env.ENABLE_RAID_MODE === 'true'
  : false;
export const RAID_MODE_ALLOW_VIDEO_PLAYBACK = process.env
  .RAID_MODE_ALLOW_VIDEO_PLAYBACK
  ? process.env.RAID_MODE_ALLOW_VIDEO_PLAYBACK === 'true'
  : false;

/**
 * URL for video archival queue, used to insert videos
 * from the request page.
 *
 * It follows the API specified in the following page
 * https://tasq.ragtag.workers.dev/
 */
export const TASQ_QUEUE_URL = process.env.TASQ_QUEUE_URL;

/**
 * Various status updates
 * Open the URL in your browser to see what the data looks like.
 */
export const STATUS_UPDATES_ENDPOINT =
  'https://archive-status-updates.ragtag.workers.dev';
export const WORKER_STATUS_ENDPOINT =
  'https://ragtag-archive-webhook.ragtag.workers.dev';

/**
 * JWT public key for bulk request page
 */
export const JWT_PUBLIC_KEY =
  '-----BEGIN PUBLIC KEY-----\n' +
  process.env.JWT_PUBLIC_KEY +
  '\n-----END PUBLIC KEY-----';
export const BULK_INSERT_ROLE = process.env.BULK_INSERT_ROLE;

/**
 * URL where files are served
 */
export const DRIVE_BASE_URL =
  process.env.DRIVE_BASE_URL || 'https://content.archive.ragtag.moe';
export const ENABLE_SIGN_URLS = process.env.ENABLE_SIGN_URLS
  ? process.env.ENABLE_SIGN_URLS === 'true'
  : false;
export const FILE_JWT_PRIVATE_KEY =
  '-----BEGIN EC PRIVATE KEY-----\n' +
  process.env.FILE_JWT_PRIVATE_KEY +
  '\n-----END EC PRIVATE KEY-----';

/**
 * Authorization for private API endpoints
 */
export const PRIVATE_API_AUTHORIZATION = process.env.PRIVATE_API_AUTHORIZATION;
