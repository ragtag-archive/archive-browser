import { NextApiRequest, NextApiResponse } from 'next';
import { signFileURLs } from '../../../../modules/shared/fileAuth';
import { getRemoteAddress } from '../../../../modules/shared/util';
import { apiSearch } from '../../v1/search';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const channel_id = (req.query.channelId as string).substr(0, 24);

  const host = req.headers.host || 'archive.ragtag.moe';
  const ip = getRemoteAddress(req);
  const videos = await apiSearch({ channel_id, size: 10000 }).then(
    (res) => res.data.hits.hits
  );

  // Sign URLs
  videos.forEach((video) =>
    signFileURLs(video._source.drive_base, video._source.files, ip)
  );

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    ...videos.map((video) => {
      const thumbnail_url = video._source.files.find(
        (file) => file.name.endsWith('.webp') || file.name.endsWith('.jpg')
      )?.url;
      return [
        '<url>',
        `<loc>https://${host}/watch?v=${video._id}</loc>`,
        '<video:video>',
        `<video:thumbnail_loc>${thumbnail_url}</video:thumbnail_loc>`,
        `<video:title><![CDATA[${video._source.title}]]></video:title>`,
        `<video:description><![CDATA[${video._source.description}]]></video:description>`,
        `<video:player_loc>https://${host}/embed/${video._id}</video:player_loc>`,
        `<video:duration>${video._source.duration}</video:duration>`,
        `<video:publication_date>${
          video._source.timestamps?.publishedAt || video._source.upload_date
        }</video:publication_date>`,
        `<video:uploader info="https://${host}/channel/${channel_id}">${video._source.channel_name}</video:uploader>`,
        '</video:video>',
        '</url>',
      ].join('\n');
    }),
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
};
