import React from "react";
import Linkify from "react-linkify";
import Head from "next/head";
import Header from "./Header";
import { apiStatusMessage } from "../../pages/api/v1/status";

export type PageBaseProps = {
  children?: React.ReactNode;
};

const PageBase = (props: PageBaseProps) => {
  const [bannerHide, setBannerHide] = React.useState(true);
  const [bannerMessage, setBannerMessage] = React.useState("");

  const fetchStatusMessage = async () => {
    const { timestamp, message, showBanner } = await apiStatusMessage();
    setBannerMessage(message);
    const lastTs = Number(
      window.localStorage.getItem("banner-timestamp") || "0"
    );
    console.log({ timestamp, lastTs });
    if (timestamp > lastTs && showBanner) setBannerHide(false);
  };

  React.useEffect(() => {
    fetchStatusMessage();
  }, []);

  return (
    <div className="bg-black text-white">
      <Head>
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </Head>
      <div
        className={
          "bg-blue-600 flex flex-col md:flex-row justify-between fixed bottom-0 left-0 right-0 z-50 " +
          (bannerHide ? "hidden" : "")
        }
      >
        <span className="px-6 py-2">
          <Linkify
            componentDecorator={(href, text, key) => (
              <a
                key={key}
                href={href}
                className="text-white underline"
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                {text}
              </a>
            )}
          >
            {bannerMessage}
          </Linkify>
        </span>
        <span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setBannerHide(true);
              window.localStorage.setItem(
                "banner-timestamp",
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
      <div className="container mx-auto mt-4">{props.children}</div>
      <div className="my-6 text-gray-500 text-center">
        Made with 🍝 by kitsune.
      </div>
    </div>
  );
};

export default PageBase;
