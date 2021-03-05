import React from "react";
import Head from "next/head";
import { ElasticSearchResult, VideoMetadata } from "./shared/database";
import PageBase from "./shared/PageBase";
import PaginatedResults from "./shared/PaginatedResults";
import { DRIVE_BASE_URL } from "./shared/config";

export type ChannelPageProps = {
  channelId: string;
  channelName: string;

  results: ElasticSearchResult<VideoMetadata>;
  page: number;
  from: number;
  size: number;
};

const ChannelPage = (props: ChannelPageProps) => {
  const { channelId, channelName, ...rest } = props;
  const description = "Browse archived videos from " + channelName;
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
          content={"https://archive.ragtag.moe/channel/" + channelId}
        />
        <meta
          property="og:image"
          content={DRIVE_BASE_URL + "/" + channelId + "/profile.jpg"}
        />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={channelName} />
        <meta property="twitter:description" content={description} />
        <meta
          property="twitter:url"
          content={"https://archive.ragtag.moe/channel/" + channelId}
        />
        <meta
          property="twitter:image"
          content={DRIVE_BASE_URL + "/" + channelId + "/profile.jpg"}
        />
      </Head>
      <div>
        <div className="px-4 my-16">
          <p className="text-lg text-center">All videos from</p>
          <h1 className="text-3xl text-center">{channelName}</h1>
        </div>
        <PaginatedResults {...rest} />
      </div>
    </PageBase>
  );
};

export default ChannelPage;
