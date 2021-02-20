import { GetServerSideProps } from "next";
import LandingPage from "../modules/LandingPage/LandingPage";
import { apiSearch } from "./api/search";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const results = await apiSearch({
    q: "",
    sort: "archived_timestamp",
    sort_order: "desc",
  });
  return { props: { videos: results.data } };
};

export default LandingPage;
