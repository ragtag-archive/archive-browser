import React from "react";
import Link from "next/link";
import Head from "next/head";
import { AggregatedChannel } from "../pages/api/v1/channels";
import PageBase from "./shared/PageBase";
import ServiceUnavailablePage from "./ServiceUnavailablePage";

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
        {channels.map((channel) => (
          <Link
            key={channel.channel_id}
            href={"/channel/" + channel.channel_id}
          >
            <a className="block border border-gray-800 mb-4 p-6 rounded">
              <strong className="text-lg">{channel.channel_name}</strong>
              <p>{channel.videos_count} videos</p>
            </a>
          </Link>
        ))}
      </div>
    </PageBase>
  );
};

export default ChannelsListPage;
