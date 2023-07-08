import React from 'react';
import Head from 'next/head';

const K_SITE_NAME = 'Ragtag Archive';
const K_SITE_DESCRIPTION = 'Preserving culture, one stream at a time';

type DefaultHeadProps = {
  title?: string;
};

const DefaultHead = (props: DefaultHeadProps) => (
  <Head>
    <title>
      {props.title ? props.title + ' - ' : ''}
      {K_SITE_NAME}
    </title>
    <meta name="title" content={K_SITE_NAME} />
    <meta name="description" content={K_SITE_DESCRIPTION} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://archive.ragtag.moe/" />
    <meta property="og:title" content={K_SITE_NAME} />
    <meta
      property="og:image"
      content="https://archive.ragtag.moe/favicon.png"
    />
    <meta property="og:description" content={K_SITE_DESCRIPTION} />
    <meta property="twitter:card" content="summary" />
    <meta property="twitter:url" content="https://archive.ragtag.moe/" />
    <meta property="twitter:title" content={K_SITE_NAME} />
    <meta
      property="twitter:image"
      content="https://archive.ragtag.moe/favicon.png"
    />
    <meta property="twitter:description" content={K_SITE_DESCRIPTION} />
    <meta property="twitter:creator" content="@kitsune_cw" />
  </Head>
);

export default DefaultHead;
