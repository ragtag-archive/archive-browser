import React from "react";
import { ElasticSearchResult, VideoMetadata } from "../../database";

type SearchContextType = {
  searchQuery?: string;
  setSearchQuery?: (newQuery: string) => any;

  searchResults?: ElasticSearchResult<VideoMetadata>;
  isLoading?: boolean;
};

const SearchContext = React.createContext<SearchContextType>({
  searchQuery: "",
  isLoading: true,
});

export default SearchContext;
