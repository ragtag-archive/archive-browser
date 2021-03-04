import { GetStaticProps } from "next";
import LandingPage from "../modules/LandingPage";
import { apiSearch, apiStorageStatistics } from "./api/v1/search";

export const getStaticProps: GetStaticProps = async (ctx) => {
  for (let tries = 0; tries < 5; tries++) {
    try {
      const [stats, vRecentArchive, vRecentUpload] = await Promise.all([
        apiStorageStatistics(),
        apiSearch({
          q: "",
          sort: "archived_timestamp",
          sort_order: "desc",
          size: 8,
        }),
        apiSearch({
          q: "",
          sort: "upload_date",
          sort_order: "desc",
          size: 8,
        }),
      ]);

      const sections = [];
      sections.push({
        title: "Recently archived",
        videos: vRecentArchive.data,
      });
      sections.push({ title: "Recently uploaded", videos: vRecentUpload.data });

      return { props: { videos: sections, stats }, revalidate: 60 };
    } catch (ex) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return { props: {}, revalidate: 1 };
};

export default LandingPage;
