import React from 'react';
import Linkify from 'react-linkify';
import Head from 'next/head';
import Header from './Header';
import { apiStatusMessage } from '../../pages/api/v1/status';
import MemoLinkify from './MemoLinkify';

export type PageBaseProps = {
  children?: React.ReactNode;
  flex?: boolean;
};

const PageBase = (props: PageBaseProps) => {
  const [bannerHide, setBannerHide] = React.useState(true);
  const [bannerMessage, setBannerMessage] = React.useState('');

  const fetchStatusMessage = async () => {
    const { timestamp, message, showBanner } = await apiStatusMessage();
    setBannerMessage(message);
    const lastTs = Number(
      window.localStorage.getItem('banner-timestamp') || '0'
    );
    console.log({ timestamp, lastTs });
    if (timestamp > lastTs && showBanner) setBannerHide(false);
  };

  React.useEffect(() => {
    fetchStatusMessage();
  }, []);

  return (
    <div className="bg-black text-white flex flex-col flex-1">
      <Head>
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </Head>
      <div
        className={
          'bg-blue-600 flex flex-1 flex-col md:flex-row justify-between fixed bottom-0 left-0 right-0 z-50 ' +
          (bannerHide ? 'hidden' : '')
        }
      >
        <span className="px-6 py-2">
          <MemoLinkify linkClassName="text-white underline">
            {bannerMessage}
          </MemoLinkify>
        </span>
        <span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setBannerHide(true);
              window.localStorage.setItem(
                'banner-timestamp',
                Date.now().toString()
              );
            }}
            className="block md:inline-block text-center px-6 py-2 bg-white text-blue-600"
          >
            OK
          </a>
        </span>
      </div>
      <Header />
      <div
        className={[
          'container mx-auto mt-4 flex-1',
          props.flex ? 'flex flex-col' : '',
        ].join(' ')}
      >
        {props.children}
      </div>
      <div className="mt-6 text-gray-500 text-center">
        Made with 🍝 by{' '}
        <a
          href="https://twitter.com/kitsune_cw"
          className="hover:underline"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          kitsune
        </a>
        .
      </div>
      <div className="mb-6 text-center">
        <a
          href="https://github.com/ragtag-archive/archive-browser"
          className="text-gray-500 hover:underline"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          Source code
        </a>
      </div>
    </div>
  );
};

export default PageBase;
