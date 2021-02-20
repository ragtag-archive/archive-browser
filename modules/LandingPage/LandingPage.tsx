import React from "react";
import Head from "next/head";
import PageBase from "../shared/PageBase";
import { ElasticSearchResult, VideoMetadata } from "../shared/database";
import VideoCard from "../shared/VideoCard";

type LandingPageProps = {
  videos: ElasticSearchResult<VideoMetadata>;
};

const LandingPage = (props: LandingPageProps) => {
  const { videos } = props;
  return (
    <PageBase>
      <Head>
        <title>Ragtag Archive</title>
      </Head>
      <div>
        <h1 className="text-3xl mt-16 text-center">Welcome to the archives</h1>
        <p className="text-lg text-center mb-16">
          Check out these latest videos
        </p>

        {videos.hits.hits.map(({ _source: video }) => (
          <VideoCard video={video} key={video.video_id} />
        ))}
      </div>
    </PageBase>
  );
};

export default LandingPage;
