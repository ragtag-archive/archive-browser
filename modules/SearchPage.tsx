import React from "react";
import Head from "next/head";
import PageBase from "./shared/PageBase";
import { ElasticSearchResult, VideoMetadata } from "./shared/database";
import VideoCard from "./shared/VideoCard";
import { formatNumber } from "./shared/format";
import Link from "next/link";
import { useRouter } from "next/router";

export type SearchPageProps = {
  q: string;
  results: ElasticSearchResult<VideoMetadata>;
  page: number;
  from: number;
  size: number;
};

const SearchPage = (props: SearchPageProps) => {
  const router = useRouter();
  const videos = props.results.hits.hits;

  const hasNext = props.from + props.size < props.results.hits.total.value;
  const hasPrev = props.from > 0;

  return (
    <PageBase>
      <Head>
        <title>{props.q} - Ragtag Archive</title>
      </Head>
      <div>
        <p>
          Showing results {props.from + 1}-
          {Math.min(props.results.hits.total.value, props.from + props.size)} of{" "}
          {formatNumber(props.results.hits.total.value)}
        </p>
        {videos.map(({ _source: video }) => (
          <VideoCard video={video} key={video.video_id} />
        ))}
        <div className="my-4 text-center">
          {hasPrev && (
            <Link
              href={{
                pathname: "/search",
                query: {
                  ...router.query,
                  page: props.page - 1,
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
            Page {props.page} of{" "}
            {Math.ceil(props.results.hits.total.value / props.size)}
          </div>
          {hasNext && (
            <Link
              href={{
                pathname: "/search",
                query: {
                  ...router.query,
                  page: props.page + 1,
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
      </div>
    </PageBase>
  );
};

export default SearchPage;
