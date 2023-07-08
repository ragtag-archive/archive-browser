import { NextApiRequest, NextApiResponse } from 'next';
import { ES_INDEX, ES_INDEX_SEARCH_LOG } from '../../../modules/shared/config';
import {
  ElasticSearchLog,
  ElasticSearchResult,
  VideoMetadata,
} from '../../../modules/shared/database.d';
import { Elastic } from '../../../modules/shared/database';

export type StorageStatistics = {
  videos: number;
  files: number;
  size: number;
  duration: number;
};
export const apiStorageStatistics = async (): Promise<StorageStatistics> => {
  const res = await apiSearchRaw({
    size: 0,
    query: {
      match_all: {},
    },
    aggregations: {
      size: {
        nested: {
          path: 'files',
        },
        aggregations: {
          sum_size: {
            sum: {
              field: 'files.size',
            },
          },
        },
      },
      total_duration: {
        sum: {
          field: 'duration',
        },
      },
    },
  });

  const countRes = await Elastic.request({
    method: 'get',
    url: '/' + ES_INDEX + '/_count',
  });

  return {
    videos: countRes.data?.count || res.data?.hits?.total?.value || -1,
    files: res.data?.aggregations?.size?.doc_count || -1,
    size: res.data?.aggregations?.size?.sum_size?.value || -1,
    duration: res.data?.aggregations?.total_duration?.value || -1,
  };
};

export const apiRelatedVideos = async (
  videoId: string
): Promise<ElasticSearchResult<VideoMetadata>> => {
  const mlt = (
    await apiSearchRaw({
      query: {
        more_like_this: {
          fields: ['title', 'description', 'channel_name'],
          like: [
            {
              _index: ES_INDEX,
              _id: videoId,
            },
          ],
        },
      },
    })
  ).data as ElasticSearchResult<VideoMetadata>;

  if (mlt.hits.total.value > 1) return mlt;

  // more_like_this didn't find any hits
  // try to find other videos from the channel
  const videoInfo = (await apiSearch({ v: videoId }))
    .data as ElasticSearchResult<VideoMetadata>;
  if (videoInfo.hits.total.value < 1) return mlt;

  const channel_uploads = await apiSearch({
    channel_id: videoInfo.hits.hits[0]._source.channel_id,
  });
  return channel_uploads.data;
};

export const ApiSearchSortFields = [
  'archived_timestamp',
  'upload_date',
  'duration',
  'view_count',
  'like_count',
  'dislike_count',
] as const;
type SortField = (typeof ApiSearchSortFields)[number];

export const apiSearch = async (query: {
  q?: string;
  v?: string;
  channel_id?: string;
  sort?: SortField;
  sort_order?: 'asc' | 'desc';
  from?: number;
  size?: number;
}) => {
  const q = query.q || '';
  const v = query.v || '';
  const channel_id = query.channel_id;
  const from = query.from || 0;
  const size = query.size || 10;

  const should = [];

  if (v) should.push({ match: { video_id: { query: v } } });
  if (channel_id) should.push({ match: { channel_id: { query: channel_id } } });
  if (q) {
    should.push(
      {
        match: {
          video_id: {
            query: q,
          },
        },
      },
      {
        match: {
          title: {
            query: q,
            operator: 'OR',
            fuzziness: 'AUTO',
            boost: 10,
          },
        },
      },
      {
        match: {
          description: {
            query: q,
            operator: 'OR',
            fuzziness: 'AUTO',
          },
        },
      },
      {
        match: {
          channel_name: {
            query: q,
            operator: 'OR',
            fuzziness: 'AUTO',
            boost: 5,
          },
        },
      }
    );
  }

  const requestData = {
    from,
    size,
    query: {
      bool: {
        should,
      },
    },
  };

  if (query.sort) {
    const sort = [
      {
        [query.sort]: query.sort_order || 'asc',
      },
    ];

    if (query.sort === 'upload_date') {
      sort.push({
        'timestamps.publishedAt': query.sort_order || 'asc',
      });
    }

    requestData['sort'] = sort;
  }

  // Log the search
  if (q) {
    const searchLog: ElasticSearchLog = {
      query: q.trim().replace(/\s+/g, ' '),
      timestamp: new Date().toISOString(),
    };
    await Elastic.request({
      method: 'post',
      url: '/' + ES_INDEX_SEARCH_LOG + '/_doc',
      data: searchLog,
    });
  }

  return apiSearchRaw<ElasticSearchResult<VideoMetadata>>(requestData);
};

export const apiSearchCompletion = async (term: string): Promise<string[]> => {
  let query: any;
  if (term.length > 0) query = { match: { query: term } };
  else query = { match_all: {} };
  const aggs = await Elastic.request({
    method: 'post',
    url: '/' + ES_INDEX_SEARCH_LOG + '/_search',
    data: {
      query: {
        bool: {
          must: [query],
          filter: [
            {
              range: {
                timestamp: { gte: 'now-7d' },
              },
            },
          ],
        },
      },
      size: 0,
      aggs: {
        top: {
          terms: {
            field: 'query.keyword',
            size: 10,
          },
        },
      },
    },
  });
  return aggs.data.aggregations.top.buckets.map((bucket: any) => bucket.key);
};

export const apiSearchRaw = <T = any>(dsl: any) =>
  Elastic.request<T>({
    method: 'get',
    url: '/' + ES_INDEX + '/_search',
    data: dsl,
  });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.completion)
    res.json(await apiSearchCompletion(String(req.query.q)));
  else res.json((await apiSearch(req.query)).data);
};
