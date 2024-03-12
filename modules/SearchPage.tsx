import React from 'react';
import Head from 'next/head';
import PageBase from './shared/PageBase';
import { ElasticSearchResult, VideoMetadata } from './shared/database.d';
import PaginatedResults from './shared/PaginatedResults';
import ServiceUnavailablePage from './ServiceUnavailablePage';
import { SITE_NAME } from './shared/config';

export type SearchPageProps = {
  q: string;

  results: ElasticSearchResult<VideoMetadata>;
  page: number;
  from: number;
  size: number;
};

const SearchPage = (props: SearchPageProps) => {
  if (!props.results) return <ServiceUnavailablePage />;

  const { q, ...rest } = props;
  return (
    <PageBase>
      <Head>
        <title>
          {q} - {SITE_NAME}
        </title>
      </Head>
      <div>
        {props.results.hits.total.value === 0 ? (
          <h1 className="text-3xl mt-16 text-center">No results</h1>
        ) : (
          <PaginatedResults {...rest} />
        )}
      </div>
    </PageBase>
  );
};

export default SearchPage;
