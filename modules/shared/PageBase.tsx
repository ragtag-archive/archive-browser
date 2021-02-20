import React from "react";
import Head from "next/head";
import Header from "./Header";

export type PageBaseProps = {
  children?: React.ReactNode;
};

const PageBase = (props: PageBaseProps) => {
  return (
    <div className="bg-black text-white md:pt-16 pt-24">
      <Head>
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </Head>
      <Header />
      <div className="container mx-auto">{props.children}</div>
    </div>
  );
};

export default PageBase;
