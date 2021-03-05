import React from "react";
import Link from "next/link";
import Head from "next/head";
import { AggregatedChannel } from "../pages/api/v1/channels";
import PageBase from "./shared/PageBase";
import ServiceUnavailablePage from "./ServiceUnavailablePage";
import { DRIVE_BASE_URL } from "./shared/config";

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
            <a className="block border border-gray-800 mb-4 p-6 rounded flex flex-row items-center">
              <img
                alt="Channel thumbnail"
                src={DRIVE_BASE_URL + "/" + channel.channel_id + "/profile.jpg"}
                className="w-16 h-16 rounded-full"
              />
              <div className="pl-4">
                <strong className="text-lg">{channel.channel_name}</strong>
                <p>{channel.videos_count} videos</p>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </PageBase>
  );
};

export default ChannelsListPage;
