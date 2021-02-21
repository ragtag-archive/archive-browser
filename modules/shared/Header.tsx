import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();
  const [search, setSearch] = React.useState((router.query.q as string) || "");

  const doSearch = (e: any) => {
    e.preventDefault();
    router.push("/search?q=" + encodeURIComponent(search));
    return false;
  };

  return (
    <div className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 flex flex-col md:flex-row py-2">
        <div className="text-2xl py-1">
          <Link href="/">
            <a>Ragtag Archive</a>
          </Link>
        </div>
        <div className="flex-1 flex justify-center py-1">
          <form
            action="/search"
            onSubmit={doSearch}
            className="w-full block mx-auto flex justify-center"
          >
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
          </form>
        </div>
        <div className="py-2">
          <Link href="/request">
            <a>Request</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
