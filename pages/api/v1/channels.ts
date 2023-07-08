import { NextApiRequest, NextApiResponse } from 'next';
import { apiSearchRaw } from './search';

export type AggregatedChannel = {
  channel_name: string;
  channel_id: string;
  videos_count: number;
  image_url?: string;
};

export const apiListChannels = async (): Promise<AggregatedChannel[]> =>
  (
    await apiSearchRaw({
      aggs: {
        channels: {
          terms: { field: 'channel_id', size: 1000 },
          aggs: { hits: { top_hits: { _source: ['channel_name'], size: 1 } } },
        },
      },
      size: 0,
    })
  ).data.aggregations.channels.buckets.map((bucket) => ({
    channel_id: bucket.key,
    channel_name: bucket.hits.hits.hits[0]._source.channel_name,
    videos_count: bucket.doc_count,
  }));

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(await apiListChannels());
};
