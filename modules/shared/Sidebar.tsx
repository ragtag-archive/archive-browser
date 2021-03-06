import Link from "next/link";
import {
  IconFileCode,
  IconFileImport,
  IconInfoCircle,
  IconTachometerAlt,
  IconTV,
} from "./icons";

type SidebarProps = {
  isOpen: boolean;
  onClose?: () => any;
};

const Sidebar = (props: SidebarProps) => {
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
          "pt-16 md:w-72 w-full bg-gray-900",
          "transition-all duration-200",
          isOpen ? "left-0" : "md:-left-72 -left-full",
        ].join(" ")}
      >
        <Link href="/channels">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconTV className={iconStyle} />
            Channels
          </a>
        </Link>
        <Link href="/request">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconFileImport className={iconStyle} />
            Request
          </a>
        </Link>
        <Link href="/speedtest">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconTachometerAlt className={iconStyle} />
            Speed test
          </a>
        </Link>
        <Link href="/about">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <IconInfoCircle className={iconStyle} />
            About
          </a>
        </Link>
        <Link href="https://app.swaggerhub.com/apis-docs/aonahara/ragtag-archive/">
          <a
            className={linkStyle}
            tabIndex={isOpen ? 0 : -1}
            target="_blank"
            rel="noreferrer noopener nofollow"
          >
            <IconFileCode className={iconStyle} />
            API
          </a>
        </Link>
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
};

export default Sidebar;
