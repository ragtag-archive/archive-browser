import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import { IconBars } from "./icons";

const Header = () => {
  const router = useRouter();
  const [search, setSearch] = React.useState((router.query.q as string) || "");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const doSearch = (e: any) => {
    e.preventDefault();

    // Try to parse search
    try {
      const url = new URL(search);
      if (["www.youtube.com", "youtube.com"].includes(url.hostname)) {
        if (url.pathname.includes("/channel/")) {
          router.push(url.pathname);
          return;
        } else if (url.pathname === "/watch" && url.searchParams.has("v")) {
          router.push("/watch?v=" + url.searchParams.get("v"));
          return;
        }
      } else if (url.hostname === "youtu.be") {
        router.push("/watch?v=" + url.pathname.substr(1));
        return;
      }
    } catch (e) {}

    router.push("/search?q=" + encodeURIComponent(search));
    return;
  };

  return (
    <>
      <div className="bg-gray-900 text-white px-6">
        <div className="flex flex-col md:flex-row py-2">
          <div className="text-2xl py-2 md:py-0 md:w-1/4 w-full h-16 md:h-10">
            <div className="absolute z-50 flex flex-row align-center">
              <button
                type="button"
                aria-label="Open sidebar"
                className="mr-2 p-2 w-10 h-10 focus:outline-none hover:bg-gray-800 focus:bg-gray-800 rounded-full"
                onClick={() => setIsSidebarOpen((x) => !x)}
              >
                <IconBars className="w-6 h-6" />
              </button>
              <Link href="/">
                <a className="py-1">Ragtag Archive</a>
              </Link>
            </div>
          </div>
          <div className="flex justify-center py-1 md:w-1/2 w-full">
            <form
              action="/search"
              onSubmit={doSearch}
              className="w-full block mx-auto flex justify-center"
            >
              <input
                type="text"
                placeholder="Search or enter YouTube URL"
                aria-label="Search box"
                className="
                  w-full rounded px-4 py-1 md:mx-2
                  bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
                  transition duration-100
                "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </div>
        </div>
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default Header;
