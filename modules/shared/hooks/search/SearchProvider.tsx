import React from "react";
import { ElasticSearchResult, VideoMetadata } from "../../database";
import SearchContext from "./SearchContext";
import axios from "axios";

const SearchProvider = (props: any) => {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchResults, setSearchResults] = React.useState<
    ElasticSearchResult<VideoMetadata>
  >(null);

  const doSearch = async () => {
    setIsLoading(true);

    const res = await axios.request({
      method: "get",
      url: "/api/search",
      params: {
        q: searchQuery,
      },
    });
    setSearchResults(res.data);

    setIsLoading(false);
  };

  React.useEffect(() => {
    doSearch();
  }, [searchQuery]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,

        searchResults,
        isLoading,
      }}
      {...props}
    />
  );
};

export default SearchProvider;
