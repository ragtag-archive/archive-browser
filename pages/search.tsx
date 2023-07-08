import { GetServerSideProps } from 'next';
import SearchPage, { SearchPageProps } from '../modules/SearchPage';
import { signFileURLs } from '../modules/shared/fileAuth';
import { getRemoteAddress } from '../modules/shared/util';
import { apiSearch } from './api/v1/search';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  for (let tries = 0; tries < 5; tries++) {
    try {
      const q = ctx.query.q as string;
      const page = Number(ctx.query.page as string) || 1;
      const size = 25;
      const from = (page - 1) * size;
      const results = (await apiSearch({ q, from, size })).data;

      const ip = getRemoteAddress(ctx.req);
      results.hits.hits.forEach((hit) =>
        signFileURLs(hit._source.drive_base, hit._source.files, ip)
      );

      const props: SearchPageProps = {
        q,
        results,
        page,
        from,
        size,
      };

      return { props };
    } catch (ex) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return { props: {} };
};

export default SearchPage;
