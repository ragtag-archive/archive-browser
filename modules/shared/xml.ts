import { ServerResponse } from 'http';

export const xmlEscape = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const xmlCData = (value: unknown): string =>
  '<![CDATA[' + String(value ?? '').replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';

export const setXmlResponseHeaders = (res: ServerResponse) => {
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
};
