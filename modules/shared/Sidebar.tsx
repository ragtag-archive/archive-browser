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
      </div>
      <div
        className={[
          "fixed inset-0 z-30 bg-black transition-all duration-200",
          isOpen ? "bg-opacity-25" : "bg-opacity-0 pointer-events-none",
        ].join(" ")}
        style={{
          WebkitBackdropFilter: isOpen ? "blur(10px)" : "",
          backdropFilter: isOpen ? "blur(10px)" : "",
        }}
        onClick={() => props.onClose?.()}
      />
    </>
  );
};

export default Sidebar;
