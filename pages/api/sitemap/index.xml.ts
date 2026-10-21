import { NextApiRequest, NextApiResponse } from 'next';
import { apiListChannels } from '../v1/channels';
import { setXmlResponseHeaders, xmlEscape } from '../../../modules/shared/xml';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const host = req.headers.host || 'archive.ragtag.moe';
  const channels = await apiListChannels();

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...channels.map((channel) =>
      [
        '<sitemap><loc>',
        xmlEscape(
          [
            'https://',
            host,
            '/api/sitemap/channel/',
            channel.channel_id,
            '.xml',
          ].join('')
        ),
        '</loc></sitemap>',
      ].join('')
    ),
    '</sitemapindex>',
  ].join('\n');

  setXmlResponseHeaders(res);
  res.write(sitemap);
  res.end();
};
