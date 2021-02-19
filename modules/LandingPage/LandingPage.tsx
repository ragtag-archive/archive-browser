import React from "react";
import { useSearch } from "../shared/hooks/search/useSearch";
import PageBase from "../shared/PageBase";
import VideoCard from "../shared/VideoCard";

const LandingPage = () => {
  const { isLoading, searchResults } = useSearch();

  const videos = isLoading ? [] : searchResults.hits.hits;

  return (
    <PageBase>
      {isLoading ? (
        <div>Loading videos...</div>
      ) : (
        <div>
          {videos.map(({ _source: video }) => (
            <VideoCard video={video} key={video.video_id} />
          ))}
        </div>
      )}
    </PageBase>
  );
};

export default LandingPage;
