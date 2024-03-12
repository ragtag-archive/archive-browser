import React from 'react';
import Head from 'next/head';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './config';

type DefaultHeadProps = {
  title?: string;
};

const DefaultHead = (props: DefaultHeadProps) => (
  <Head>
    <title>
      {props.title ? props.title + ' - ' : ''}
      {SITE_NAME}
    </title>
    <meta name="title" content={SITE_NAME} />
    <meta name="description" content={SITE_DESCRIPTION} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={SITE_URL} />
    <meta property="og:title" content={SITE_NAME} />
    <meta property="og:image" content={SITE_URL + 'favicon.png'} />
    <meta property="og:description" content={SITE_DESCRIPTION} />
    <meta property="twitter:card" content="summary" />
    <meta property="twitter:url" content={SITE_URL} />
    <meta property="twitter:title" content={SITE_NAME} />
    <meta property="twitter:image" content={SITE_URL + 'favicon.png'} />
    <meta property="twitter:description" content={SITE_DESCRIPTION} />
    <meta property="twitter:creator" content="@kitsune_cw" />
  </Head>
);

export default DefaultHead;
