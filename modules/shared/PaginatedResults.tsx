import React from "react";
import { useRouter } from "next/router";
import { ElasticSearchResult, VideoMetadata } from "./database";
import Link from "next/link";
import VideoCard from "./VideoCard";

export type PaginatedResultsProps = {
  results: ElasticSearchResult<VideoMetadata>;
  page: number;
  from: number;
  size: number;
};

const PaginatedResults = (props: PaginatedResultsProps) => {
  const { results, page, from, size } = props;
  const router = useRouter();
  const videos = results.hits.hits;

  const totalResults = results.hits.total.value;
  const hasNext = from + size < totalResults;
  const hasPrev = from > 0;

  return (
    <>
      {videos.map(({ _source: video }) => (
        <VideoCard video={video} key={video.video_id} />
      ))}
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
          >
            <a
              className="
                bg-gray-800
                hover:bg-gray-700
                focus:bg-gray-900 focus:outline-none
                px-4 py-2 rounded
                transition duration-200
              "
            >
              Previous
            </a>
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
          >
            <a
              className="
                bg-gray-800
                hover:bg-gray-700
                focus:bg-gray-900 focus:outline-none
                px-4 py-2 rounded
                transition duration-200
              "
            >
              Next
            </a>
          </Link>
        )}
      </div>
    </>
  );
};

export default PaginatedResults;
