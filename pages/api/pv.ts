import { NextApiRequest, NextApiResponse } from 'next';
import { ES_INDEX, ES_INDEX_PAGE_VIEWS } from '../../modules/shared/config';
import {
  ElasticSearchResult,
  VideoMetadata,
} from '../../modules/shared/database.d';
import { Elastic } from '../../modules/shared/database';
import { getRemoteAddress } from '../../modules/shared/util';

export const apiGetPopularVideos = async (max: number = 8) => {
  // Create aggregation
  const buckets = await Elastic.request({
    method: 'post',
    url: '/' + ES_INDEX_PAGE_VIEWS + '/_search',
    data: {
      query: {
        bool: {
          filter: [
            {
              range: {
                timestamp: {
                  gte: 'now-7d',
                },
              },
            },
          ],
          must_not: [
            {
              match: {
                video_id: '(none)',
              },
            },
          ],
        },
      },
      size: 0,
      aggs: {
        popular: {
          terms: {
            field: 'video_id',
            size: max,
          },
          aggs: {
            score: {
              sum: {
                script: {
                  lang: 'painless',
                  source: `
                    long duration = 7 * 24 * 3600 * 1000; // 1 week
                    long start = params['now'] - duration;
                    long docTs = doc['timestamp'].value.toInstant().toEpochMilli();
                    return docTs - start;
                  `,
                  params: {
                    now: Date.now(),
                  },
                },
              },
            },
          },
        },
      },
    },
  })
    .then((res) =>
      res.data.aggregations.popular.buckets.map((bucket: any) => ({
        id: bucket.key,
        score: bucket.score.value,
      }))
    )
    .catch((err) => {
      console.error(err);
      return [];
    });

  // Sort videos
  const videoIds = buckets
    .sort((a: any, b: any) => b.score - a.score)
    .map((x: any) => x.id);

  // Get video documents
  const videos = await Elastic.request({
    method: 'get',
    url: '/' + ES_INDEX + '/_mget',
    data: { ids: videoIds },
  })
    .then((res) => res.data.docs.filter((hit: any) => hit._source))
    .catch((err) => {
      console.error(err);
      return [];
    });

  const result: Partial<ElasticSearchResult<VideoMetadata>> = {
    hits: {
      total: {
        relation: 'eq',
        value: videos.length,
      },
      max_score: 0,
      hits: videos,
    },
  };
  return result;
};

export const apiRegisterPageview = async (params: {
  channelId?: string;
  videoId?: string;
  ip: string;
}) =>
  Elastic.request({
    method: 'post',
    url: '/' + ES_INDEX_PAGE_VIEWS + '/_doc',
    data: {
      timestamp: new Date().toISOString(),
      channel_id: params.channelId,
      video_id: params.videoId,
      ip: params.ip,
    },
  });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const ip = getRemoteAddress(req);
  if (ip === '127.0.0.1' || ip === '::1') return res.status(204).end();

  await apiRegisterPageview({
    channelId: (req.query.channel_id as string) || '(none)',
    videoId: (req.query.video_id as string) || '(none)',
    ip,
  });
  res.status(204).end();
};
