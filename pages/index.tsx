import { GetStaticProps } from "next";
import LandingPage from "../modules/LandingPage";
import { apiSearch, apiStorageStatistics } from "./api/v1/search";

export const getStaticProps: GetStaticProps = async (ctx) => {
  for (let tries = 0; tries < 5; tries++) {
    try {
      const [results, stats] = await Promise.all([
        apiSearch({
          q: "",
          sort: "archived_timestamp",
          sort_order: "desc",
        }),
        apiStorageStatistics(),
      ]);

      return { props: { videos: results.data, stats }, revalidate: 60 };
    } catch (ex) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return { props: {}, revalidate: 1 };
};

export default LandingPage;
