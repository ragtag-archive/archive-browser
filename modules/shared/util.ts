import { IncomingMessage } from 'http';

export const checkAutoplay = (): Promise<boolean> =>
  new Promise((resolve) => {
    try {
      const audio = new Audio();
      audio.autoplay = true;
      audio.addEventListener('play', () => resolve(true));
      audio.addEventListener('error', () => resolve(false));
      audio.src =
        'data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
      setTimeout(() => resolve(false), 5000);
    } catch (e) {
      resolve(false);
    }
  });

const firstHeaderValue = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.split(',')[0].trim() || '';

export const getRemoteAddress = (req: IncomingMessage): string =>
  firstHeaderValue(req.headers['cf-connecting-ip']) ||
  firstHeaderValue(req.headers['x-forwarded-for']) ||
  req.socket.remoteAddress ||
  '';

export const proxyYT3 = (url: string): string => {
  try {
    const u = new URL(url);
    if (u.hostname !== 'yt3.ggpht.com') return url;
    u.hostname = 'archive-yt3-ggpht-proxy.ragtag.moe';
    return u.toString();
  } catch (ex) {
    return '';
  }
};

export const parseTimestamp = (timestamp: string): Date =>
  new Date(
    timestamp + (timestamp.endsWith('Z') || timestamp.includes('+') ? '' : 'Z')
  );
