import React from 'react';
import PageBase from './shared/PageBase';
import { ElasticSearchResult, VideoMetadata } from './shared/database.d';
import VideoCard from './shared/VideoCard';
import { StorageStatistics } from '../pages/api/v1/search';
import { formatBytes, formatNumber } from './shared/format';
import DefaultHead from './shared/DefaultHead';
import ServiceUnavailablePage from './ServiceUnavailablePage';

type VideoSection = {
  title: string;
  videos: ElasticSearchResult<VideoMetadata>;
};

type LandingPageProps = {
  videos?: VideoSection[];
  stats?: StorageStatistics;
};

const LandingPage = (props: LandingPageProps) => {
  if (!props.videos || !props.stats) return <ServiceUnavailablePage />;

  const { videos, stats } = props;
  const formatSize = formatBytes(stats.size);
  const totalHours = formatNumber(Math.floor(stats.duration / 60 / 60));

  return (
    <PageBase>
      <DefaultHead />
      <div>
        <div className="px-4">
          <h1 className="text-3xl mt-16 text-center">
            Welcome to the archives
          </h1>
          <p className="text-lg text-center">
            We have {formatNumber(stats.videos)} videos worth {totalHours} hours
            of content, taking up {formatSize} in storage space.
          </p>
        </div>

        <div className="px-4 text-center mt-4">
          <div className="bg-blue-600 inline-block px-4 py-2 rounded">
            If you find this website useful, please help keep us up and running.{' '}
            <a
              className="font-bold underline"
              rel="noreferrer noopener nofollow"
              href="https://www.patreon.com/kitsune_cw"
              target="_blank"
            >
              Patreon
            </a>
            ,{' '}
            <a
              className="font-bold underline"
              rel="noreferrer noopener nofollow"
              href="https://ko-fi.com/kitsune_cw"
              target="_blank"
            >
              Ko-fi
            </a>
          </div>
        </div>

        {videos.map((section, idx) => (
          <div key={section.title} className="py-6">
            <h1 className="text-2xl font-bold px-4 sm:px-2">{section.title}</h1>
            <div>
              {section.videos.hits.hits.map(({ _source: video }) => (
                <div
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 sm:px-2 py-4 inline-block"
                  key={video.video_id}
                >
                  <VideoCard small video={video} />
                </div>
              ))}
            </div>
            {idx < videos.length - 1 && (
              <div className="border-b-2 border-gray-600 w-1/3 mx-auto" />
            )}
          </div>
        ))}
      </div>
    </PageBase>
  );
};

export default LandingPage;
