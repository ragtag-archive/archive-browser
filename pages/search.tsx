import { GetServerSideProps } from "next";
import SearchPage, { SearchPageProps } from "../modules/SearchPage";
import { apiSearch } from "./api/search";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const q = ctx.query.q as string;
  const page = Number(ctx.query.page as string) || 1;
  const results = (await apiSearch({ q })).data;

  const props: SearchPageProps = {
    q,
    results,
    page,
  };

  return { props };
};

export default SearchPage;
