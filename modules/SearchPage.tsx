import React from "react";
import Head from "next/head";
import PageBase from "./shared/PageBase";
import { ElasticSearchResult, VideoMetadata } from "./shared/database";
import VideoCard from "./shared/VideoCard";

export type SearchPageProps = {
  q: string;
  results: ElasticSearchResult<VideoMetadata>;
  page?: number;
};

const SearchPage = (props: SearchPageProps) => {
  const videos = props.results.hits.hits;

  return (
    <PageBase>
      <Head>
        <title>{props.q} - Ragtag Archive</title>
      </Head>
      <div>
        {videos.map(({ _source: video }) => (
          <VideoCard video={video} key={video.video_id} />
        ))}
      </div>
    </PageBase>
  );
};

export default SearchPage;
