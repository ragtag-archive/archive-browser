import React from "react";
import Link from "next/link";
import {
  IconExclamationCirlce,
  IconFileCode,
  // IconFileImport,
  IconInfoCircle,
  IconPlayCircle,
  // IconTachometerAlt,
  IconTV,
} from "./icons";

type SidebarProps = {
  isOpen: boolean;
  onClose?: () => any;
};

const Sidebar = React.memo((props: SidebarProps) => {
  const { isOpen } = props;

  const linkStyle =
    "flex flex-row block focus:outline-none focus:bg-gray-800 hover:bg-gray-800 p-4 px-8 transition duration-200";
  const iconStyle = "w-6 h-6 mr-4";

  return (
    <>
      <div
        className={[
          "fixed z-40",
          "left-0 top-0 bottom-0",
          "pt-16 md:w-72 w-3/4 bg-gray-900",
          "transition-all duration-200",
          isOpen ? "left-0" : "md:-left-72 -left-full",
          "flex flex-col",
        ].join(" ")}
      >
        <Link href="/channels">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconTV className={iconStyle} />
            Channels
          </a>
        </Link>
        {/* <Link href="/request">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconFileImport className={iconStyle} />
            Request
          </a>
        </Link> */}

        <div className="flex-1" />

        <Link href="/about">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconInfoCircle className={iconStyle} />
            About
          </a>
        </Link>
        {/* <Link href="https://app.swaggerhub.com/apis-docs/aonahara/ragtag-archive/"> */}
        <Link href="/api-docs">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconFileCode className={iconStyle} />
            API
          </a>
        </Link>
        <Link href="/player">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconPlayCircle className={iconStyle} />
            Player
          </a>
        </Link>

        <Link href="/status">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconExclamationCirlce className={iconStyle} />
            Status
          </a>
        </Link>
        {/*<Link href="/speedtest">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconTachometerAlt className={iconStyle} />
            Speed test
          </a>
        </Link>*/}
      </div>
      <div
        className={[
          "fixed inset-0 z-30 bg-black transition-all duration-200",
          isOpen ? "bg-opacity-75" : "bg-opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={() => props.onClose?.()}
      />
    </>
  );
});

export default Sidebar;
