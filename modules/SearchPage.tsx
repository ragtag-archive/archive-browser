import React from "react";
import Head from "next/head";
import PageBase from "./shared/PageBase";
import { ElasticSearchResult, VideoMetadata } from "./shared/database";
import PaginatedResults from "./shared/PaginatedResults";

export type SearchPageProps = {
  q: string;

  results: ElasticSearchResult<VideoMetadata>;
  page: number;
  from: number;
  size: number;
};

const SearchPage = (props: SearchPageProps) => {
  const { q, ...rest } = props;
  return (
    <PageBase>
      <Head>
        <title>{q} - Ragtag Archive</title>
      </Head>
      <div>
        <PaginatedResults {...rest} />
      </div>
    </PageBase>
  );
};

export default SearchPage;
