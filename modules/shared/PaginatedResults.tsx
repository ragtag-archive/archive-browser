import React from 'react';
import { useRouter } from 'next/router';
import { ElasticSearchResult, VideoMetadata } from './database.d';
import Link from 'next/link';
import VideoCard from './VideoCard';
import { formatNumber } from './format';

export type PaginatedResultsProps = {
  results: ElasticSearchResult<VideoMetadata>;
  page: number;
  from: number;
  size: number;
  grid?: boolean;
};

const PaginatedResults = (props: PaginatedResultsProps) => {
  const { results, page, from, size } = props;
  const grid = props.grid;
  const router = useRouter();
  const videos = results.hits.hits;

  const totalResults = results.hits.total.value;
  const hasNext = from + size < totalResults;
  const hasPrev = from > 0;

  return (
    <>
      <p className="md:px-0 px-4">
        Showing results {from + 1}-
        {Math.min(results.hits.total.value, from + size)} of{' '}
        {results.hits.total.relation === 'eq' ? '' : 'around '}
        {formatNumber(results.hits.total.value)}
      </p>
      <div>
        {videos.map(({ _source: video }) => (
          <div
            className={
              grid
                ? 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4 sm:px-2 py-4 inline-block'
                : ''
            }
            key={video.video_id}
          >
            <VideoCard small={grid} video={video} key={video.video_id} />
          </div>
        ))}
      </div>
      <div className="my-4 text-center">
        {hasPrev && (
          <Link
            href={{
              pathname: router.pathname,
              query: {
                ...router.query,
                page: page - 1,
              },
            }}
            className="
              bg-gray-800
              hover:bg-gray-700
              focus:bg-gray-900 focus:outline-none
              px-4 py-2 rounded
              transition duration-200
            "
          >
            Previous
          </Link>
        )}
        <div className="mx-4 inline-block">
          Page {page} of {Math.ceil(results.hits.total.value / size)}
        </div>
        {hasNext && (
          <Link
            href={{
              pathname: router.pathname,
              query: {
                ...router.query,
                page: page + 1,
              },
            }}
            className="
              bg-gray-800
              hover:bg-gray-700
              focus:bg-gray-900 focus:outline-none
              px-4 py-2 rounded
              transition duration-200
            "
          >
            Next
          </Link>
        )}
      </div>
    </>
  );
};

export default PaginatedResults;
