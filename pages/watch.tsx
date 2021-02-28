import axios from "axios";
import { GetServerSideProps } from "next";
import {
  ES_BACKEND_URL,
  ES_INDEX,
  ES_BASIC_USERNAME,
  ES_BASIC_PASSWORD,
} from "../modules/shared/config";
import { ElasticSearchResult, VideoMetadata } from "../modules/shared/database";
import WatchPage, { WatchPageProps } from "../modules/WatchPage";
import { apiRelatedVideos, apiSearch } from "./api/v1/search";
import { apiVideo } from "./api/video";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  for (let tries = 0; tries < 5; tries++) {
    try {
      const v = (ctx.query.v as string).trim();

      if (!v) return { notFound: true };

      const [searchResult, related] = await Promise.all([
        apiSearch({ v }),
        apiRelatedVideos(v),
      ]);
      const _searchResult = searchResult.data as ElasticSearchResult<VideoMetadata>;
      if (_searchResult.hits.total.value === 0) return { notFound: true };
      const videoInfo = _searchResult.hits.hits[0]._source;

      // Fetch file list from GDrive if not available in database
      const files = Array.isArray(videoInfo.files)
        ? videoInfo.files
        : await apiVideo({ v }).then(({ urls }) =>
            urls
              .map((url) => ({ name: url.split("/")[2], size: -1 }))
              .filter((file) => !!file.name)
          );

      // Update database if file list not available
      if (!Array.isArray(videoInfo.files)) {
        console.log("Updating DB with files", files);
        const updateres = await axios
          .request({
            method: "post",
            baseURL: ES_BACKEND_URL,
            url: "/" + ES_INDEX + "/_update/" + v,
            auth: {
              username: ES_BASIC_USERNAME,
              password: ES_BASIC_PASSWORD,
            },
            data: { doc: { files } },
          })
          .catch(({ response }) => response);
        console.log(updateres.data);
      }

      const props: WatchPageProps = {
        videoInfo: {
          ...videoInfo,
          files,
        },
        hasChat: !!files.find((file) => file.name === v + ".chat.json"),
        relatedVideos: related.hits.hits
          .map((hit) => hit._source)
          .filter((video) => video.video_id !== v),
      };

      return { props };
    } catch (ex) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return { props: {} };
};

export default WatchPage;
