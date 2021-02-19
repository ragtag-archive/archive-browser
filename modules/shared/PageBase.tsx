import React from "react";
import Header from "./Header";

export type PageBaseProps = {
  children?: React.ReactNode;
};

const PageBase = (props: PageBaseProps) => {
  return (
    <div>
      <Header />
      {props.children}
    </div>
  );
};

export default PageBase;
