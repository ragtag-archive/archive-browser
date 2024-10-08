import React from 'react';
import Head from 'next/head';
import PageBase from '../modules/shared/PageBase';
import { SITE_NAME } from '../modules/shared/config';

const NotFoundPage = () => {
  return (
    <PageBase>
      <Head>
        <title>404 - {SITE_NAME}</title>
      </Head>
      <div>
        <div className="px-4">
          <h1 className="text-3xl mt-16 text-center">404</h1>
          <p className="text-lg text-center mb-16">Page not found</p>
        </div>
      </div>
    </PageBase>
  );
};

export default NotFoundPage;
