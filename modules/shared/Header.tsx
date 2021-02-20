import React from "react";
import Link from "next/link";
import { useSearch } from "./hooks/search/useSearch";
import { useDebounce } from "./hooks/useDebounce";

const Header = () => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 1000);
  const { setSearchQuery } = useSearch();

  React.useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="fixed inset-x-0 top-0 bg-gray-900 text-white z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row py-2">
        <div className="text-2xl py-1">
          <Link href="/">
            <a>Ragtag Archive</a>
          </Link>
        </div>
        <div className="flex-1 flex justify-center py-1">
          <input
            type="text"
            placeholder="Search"
            className="
              lg:w-1/2 w-full rounded px-4 py-1 md:mx-2
              bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
              transition duration-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Quick hack to center the search box */}
        <div className="text-2xl py-1 opacity-0 hidden md:block" aria-hidden>
          Ragtag Archive
        </div>
      </div>
    </div>
  );
};

export default Header;
