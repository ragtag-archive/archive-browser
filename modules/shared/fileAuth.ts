import jsonwebtoken from 'jsonwebtoken';
import {
  DRIVE_BASE_URL,
  ENABLE_SIGN_URLS,
  FILE_JWT_PRIVATE_KEY,
} from './config';
import { VideoFile } from './database.d';

const K_EXTENSION_BYPASS = ['jpg', 'webp'];

export const signURL = (url: string, ip: string) => {
  if (!ENABLE_SIGN_URLS) return url;

  const u = new URL(url);
  const host = u.hostname;
  const path = u.pathname;

  const ext = path.split('.').pop();
  if (K_EXTENSION_BYPASS.includes(ext)) return url;

  const jwt = jsonwebtoken.sign(
    {
      host,
      path,
      ip,
    },
    FILE_JWT_PRIVATE_KEY,
    {
      algorithm: 'ES256',
      expiresIn: '24h',
      issuer: 'archive.ragtag.moe',
    }
  );
  u.searchParams.set('X-Ragtag-Auth', jwt);
  return u.toString();
};

export const signFileURLs = (
  driveBaseFolder: string,
  files: VideoFile[],
  ip: string
) => {
  // Construct upstream tag, default to `gd:` if not specified
  const upstreamTag = driveBaseFolder.includes(':')
    ? driveBaseFolder
    : 'gd:' + driveBaseFolder;

  files.forEach((file, idx) => {
    // Create the URL if not specified
    const fullUrl = [
      DRIVE_BASE_URL,
      upstreamTag,
      file.name.split('.')[0],
      file.name,
    ].join('/');

    // Set the URL
    files[idx].url = signURL(file.url || fullUrl, ip);
  });
};
