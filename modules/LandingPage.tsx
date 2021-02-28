import React from "react";
import PageBase from "./shared/PageBase";
import { ElasticSearchResult, VideoMetadata } from "./shared/database";
import VideoCard from "./shared/VideoCard";
import { StorageStatistics } from "../pages/api/v1/search";
import { formatBytes, formatNumber } from "./shared/format";
import DefaultHead from "./shared/DefaultHead";
import ServiceUnavailablePage from "./ServiceUnavailablePage";

type LandingPageProps = {
  videos?: ElasticSearchResult<VideoMetadata>;
  stats?: StorageStatistics;
};

const LandingPage = (props: LandingPageProps) => {
  if (!props.videos || !props.stats) return <ServiceUnavailablePage />;

  const { videos, stats } = props;
  const formatSize = formatBytes(stats.size);

  return (
    <PageBase>
      <DefaultHead />
      {videos?.hits?.total?.value > 0 ? (
        <div>
          <div className="px-4">
            <h1 className="text-3xl mt-16 text-center">
              Welcome to the archives
            </h1>
            <p className="text-lg text-center">
              We have {formatNumber(videos.hits.total.value)} videos using up{" "}
              {formatSize} of data.
            </p>
            <p className="text-lg text-center mb-16">
              Here are the latest ones.
            </p>
          </div>

          {videos.hits.hits.map(({ _source: video }) => (
            <VideoCard video={video} key={video.video_id} />
          ))}
        </div>
      ) : (
        <div className="px-4">
          <h1 className="text-3xl mt-16 text-center">
            Service temporarily unavailable
          </h1>
          <p className="text-lg text-center">Come back in a minute or two.</p>
        </div>
      )}
    </PageBase>
  );
};

export default LandingPage;
