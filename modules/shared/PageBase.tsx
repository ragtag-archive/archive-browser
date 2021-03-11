import React from "react";
import Head from "next/head";
import Header from "./Header";

export type PageBaseProps = {
  children?: React.ReactNode;
};

const PageBase = (props: PageBaseProps) => {
  const [bannerHide, setBannerHide] = React.useState(true);

  React.useEffect(() => {
    const item = window.localStorage.getItem("high-traffic-banner");
    if (item) setBannerHide(JSON.parse(item));
    else setBannerHide(false);
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
          We're experiencing increased traffic to our website. Things will
          break. Come back a few days if you have problems accessing content.
        </span>
        <span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setBannerHide(true);
              window.localStorage.setItem(
                "high-traffic-banner",
                JSON.stringify(true)
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
