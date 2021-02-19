const Header = () => {
  return (
    <div className="fixed inset-x-0 top-0 bg-gray-900 text-white">
      <div className="container mx-auto px-6 flex flex-col md:flex-row py-2">
        <div className="text-2xl py-1">Ragtag Archive</div>
        <div className="flex-1 flex justify-center py-1">
          <input
            type="text"
            placeholder="Search"
            className="
              lg:w-1/2 w-full rounded px-4 py-1 md:mx-2
              bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
              transition duration-100"
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
