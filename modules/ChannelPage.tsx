import React from 'react';
import Head from 'next/head';
import { ElasticSearchResult, VideoMetadata } from './shared/database.d';
import PageBase from './shared/PageBase';
import PaginatedResults from './shared/PaginatedResults';
import { IconYouTube } from './shared/icons';
import { NextImage } from './shared/NextImage';

export type ChannelPageProps = {
  channelId: string;
  channelName: string;
  channelImageURL: string;

  results: ElasticSearchResult<VideoMetadata>;
  page: number;
  from: number;
  size: number;
};

const ChannelPage = (props: ChannelPageProps) => {
  const { channelId, channelName, channelImageURL, ...rest } = props;
  const description = 'Browse archived videos from ' + channelName;
  const profileImage = channelImageURL;

  React.useEffect(() => {
    if (!channelId) return;
    fetch('/api/pv?channel_id=' + channelId);
  }, [channelId]);

  return (
    <PageBase>
      <Head>
        <title>{channelName} - Ragtag Archive</title>
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ragtag Archive" />
        <meta property="og:title" content={channelName} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={'https://archive.ragtag.moe/channel/' + channelId}
        />
        <meta property="og:image" content={profileImage} />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={channelName} />
        <meta property="twitter:description" content={description} />
        <meta
          property="twitter:url"
          content={'https://archive.ragtag.moe/channel/' + channelId}
        />
        <meta property="twitter:image" content={profileImage} />
      </Head>
      <div>
        <div className="px-4 my-16">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full relative overflow-hidden">
            <NextImage
              src={profileImage}
              width={128}
              height={128}
              alt="Profile photo"
              layout="fixed"
              priority
            />
          </div>
          <p className="text-lg text-center">All videos from</p>
          <h1 className="text-3xl text-center">{channelName}</h1>
          <div className="flex mt-2 justify-center">
            <a
              href={'https://youtube.com/channel/' + channelId}
              target="_blank"
              rel="noreferrer noopener"
              className="
                bg-gray-800
                hover:bg-gray-700
                focus:bg-gray-900 focus:outline-none
                px-4 py-2 md:mr-2 mb-2 md:mb-0 rounded
                transition duration-200
                flex flex-row items-center
              "
            >
              <IconYouTube className="w-4 h-4 mr-3" />
              Watch on YouTube
            </a>
          </div>
        </div>
        <PaginatedResults grid {...rest} />
      </div>
    </PageBase>
  );
};

export default ChannelPage;
