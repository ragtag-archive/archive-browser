import React from "react";
import Header from "./Header";

export type PageBaseProps = {
  children?: React.ReactNode;
};

const PageBase = (props: PageBaseProps) => {
  return (
    <div className="bg-black text-white md:pt-16 pt-24">
      <Header />
      <div className="container mx-auto">{props.children}</div>
    </div>
  );
};

export default PageBase;
