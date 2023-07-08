import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { AggregatedChannel } from '../pages/api/v1/channels';
import PageBase from './shared/PageBase';
import ServiceUnavailablePage from './ServiceUnavailablePage';
import { NextImage } from './shared/NextImage';

export type ChannelsListPageProps = {
  channels?: AggregatedChannel[];
};

const ChannelsListPage = (props: ChannelsListPageProps) => {
  if (!props.channels) return <ServiceUnavailablePage />;

  const { channels } = props;
  return (
    <PageBase>
      <Head>
        <title>Channels - Ragtag Archive</title>
      </Head>
      <div className="">
        {channels.map((channel, idx) => (
          <Link
            key={channel.channel_id}
            href={'/channel/' + channel.channel_id}
            className="block border border-gray-800 mb-4 p-6 rounded flex flex-row items-center"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden relative">
              {channel.image_url && (
                <NextImage
                  alt="Channel thumbnail"
                  src={channel.image_url}
                  layout="fixed"
                  width={64}
                  height={64}
                  priority={idx < 12}
                />
              )}
            </div>
            <div className="pl-4">
              <strong className="text-lg">{channel.channel_name}</strong>
              <p>{channel.videos_count} videos</p>
            </div>
          </Link>
        ))}
      </div>
    </PageBase>
  );
};

export default ChannelsListPage;
