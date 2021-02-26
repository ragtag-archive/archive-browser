import Link from "next/link";

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
              className={iconStyle}
            >
              <path
                fill="currentColor"
                d="M592 0H48A48 48 0 0 0 0 48v320a48 48 0 0 0 48 48h240v32H112a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H352v-32h240a48 48 0 0 0 48-48V48a48 48 0 0 0-48-48zm-16 352H64V64h512z"
              />
            </svg>
            Channels
          </a>
        </Link>
        <Link href="/request">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className={iconStyle}
            >
              <path
                fill="currentColor"
                d="M16 288c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h112v-64zm489-183L407.1 7c-4.5-4.5-10.6-7-17-7H384v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-153 31V0H152c-13.3 0-24 10.7-24 24v264h128v-65.2c0-14.3 17.3-21.4 27.4-11.3L379 308c6.6 6.7 6.6 17.4 0 24l-95.7 96.4c-10.1 10.1-27.4 3-27.4-11.3V352H128v136c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H376c-13.2 0-24-10.8-24-24z"
              />
            </svg>
            Request
          </a>
        </Link>
        <Link href="/about">
          <a className={linkStyle} tabIndex={isOpen ? 0 : -1}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className={iconStyle}
            >
              <path
                fill="currentColor"
                d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
              />
            </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              className={iconStyle}
            >
              <path
                fill="currentColor"
                d="M384 121.941V128H256V0h6.059c6.365 0 12.47 2.529 16.971 7.029l97.941 97.941A24.005 24.005 0 0 1 384 121.941zM248 160c-13.2 0-24-10.8-24-24V0H24C10.745 0 0 10.745 0 24v464c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24V160H248zM123.206 400.505a5.4 5.4 0 0 1-7.633.246l-64.866-60.812a5.4 5.4 0 0 1 0-7.879l64.866-60.812a5.4 5.4 0 0 1 7.633.246l19.579 20.885a5.4 5.4 0 0 1-.372 7.747L101.65 336l40.763 35.874a5.4 5.4 0 0 1 .372 7.747l-19.579 20.884zm51.295 50.479l-27.453-7.97a5.402 5.402 0 0 1-3.681-6.692l61.44-211.626a5.402 5.402 0 0 1 6.692-3.681l27.452 7.97a5.4 5.4 0 0 1 3.68 6.692l-61.44 211.626a5.397 5.397 0 0 1-6.69 3.681zm160.792-111.045l-64.866 60.812a5.4 5.4 0 0 1-7.633-.246l-19.58-20.885a5.4 5.4 0 0 1 .372-7.747L284.35 336l-40.763-35.874a5.4 5.4 0 0 1-.372-7.747l19.58-20.885a5.4 5.4 0 0 1 7.633-.246l64.866 60.812a5.4 5.4 0 0 1-.001 7.879z"
              />
            </svg>
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
