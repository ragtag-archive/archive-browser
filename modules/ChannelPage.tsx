import React from "react";
import Head from "next/head";
import { ElasticSearchResult, VideoMetadata } from "./shared/database";
import PageBase from "./shared/PageBase";
import PaginatedResults from "./shared/PaginatedResults";

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
  return (
    <PageBase>
      <Head>
        <title>{channelName} - Ragtag Archive</title>
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
