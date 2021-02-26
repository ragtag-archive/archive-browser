import React from "react";
import Head from "next/head";
import PageBase from "./shared/PageBase";
import { ElasticSearchResult, VideoMetadata } from "./shared/database";
import VideoCard from "./shared/VideoCard";
import { StorageStatistics } from "../pages/api/v1/search";
import { formatBytes, formatNumber } from "./shared/format";

type LandingPageProps = {
  videos: ElasticSearchResult<VideoMetadata>;
  stats: StorageStatistics;
};

const LandingPage = (props: LandingPageProps) => {
  const { videos, stats } = props;

  const siteName = "Ragtag Archive";
  const siteDesc = "Preserving culture, one stream at a time";

  const formatSize = formatBytes(stats.size);

  return (
    <PageBase>
      <Head>
        <title>Ragtag Archive</title>
        <meta name="title" content={siteName} />
        <meta name="description" content={siteDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://archive.ragtag.moe/" />
        <meta property="og:title" content={siteName} />
        <meta
          property="og:image"
          content="https://archive.ragtag.moe/favicon.png"
        />
        <meta property="og:description" content={siteDesc} />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content="https://archive.ragtag.moe/" />
        <meta property="twitter:title" content={siteName} />
        <meta
          property="twitter:image"
          content="https://archive.ragtag.moe/favicon.png"
        />
        <meta property="twitter:description" content={siteDesc} />
        <meta property="twitter:creator" content="@kitsune_cw" />
      </Head>
      <div>
        <div className="px-4">
          <h1 className="text-3xl mt-16 text-center">
            Welcome to the archives
          </h1>
          <p className="text-lg text-center">
            We have {formatNumber(videos.hits.total.value)} videos using up{" "}
            {formatSize} of data.
          </p>
          <p className="text-lg text-center mb-16">Here are the latest ones.</p>
        </div>

        {videos.hits.hits.map(({ _source: video }) => (
          <VideoCard video={video} key={video.video_id} />
        ))}
      </div>
    </PageBase>
  );
};

export default LandingPage;
