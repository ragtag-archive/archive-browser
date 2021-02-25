import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";

const Header = () => {
  const router = useRouter();
  const [search, setSearch] = React.useState((router.query.q as string) || "");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const doSearch = (e: any) => {
    e.preventDefault();
    router.push("/search?q=" + encodeURIComponent(search));
    return false;
  };

  return (
    <>
      <div className="bg-gray-900 text-white px-6">
        <div className="flex flex-col md:flex-row py-2">
          <div className="text-2xl py-2 md:py-0 md:w-1/4 w-full h-16 md:h-10">
            <div className="absolute z-50 flex flex-row align-center">
              <button
                type="button"
                className="mr-2 p-2 w-10 h-10 focus:outline-none hover:bg-gray-800 focus:bg-gray-800 rounded-full"
                onClick={() => setIsSidebarOpen((x) => !x)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="w-6 h-6"
                >
                  <path
                    fill="currentColor"
                    d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"
                  />
                </svg>
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
                placeholder="Search"
                className="
                w-full rounded px-4 py-1 md:mx-2
                bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
                transition duration-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </div>
        </div>
      </div>
      <Sidebar isOpen={isSidebarOpen} />
    </>
  );
};

export default Header;
