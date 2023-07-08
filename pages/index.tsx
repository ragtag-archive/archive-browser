import { GetServerSideProps } from 'next';
import LandingPage from '../modules/LandingPage';
import { signFileURLs } from '../modules/shared/fileAuth';
import { apiGetPopularVideos } from './api/pv';
import { apiSearch, apiStorageStatistics } from './api/v1/search';

const getPageProps = async (ip?: string) => {
  const [stats, vRecentArchive, vRecentUpload, vPopular] = await Promise.all([
    apiStorageStatistics(),
    apiSearch({
      q: '',
      sort: 'archived_timestamp',
      sort_order: 'desc',
      size: 8,
    }),
    apiSearch({
      q: '',
      sort: 'upload_date',
      sort_order: 'desc',
      size: 12,
    }),
    apiGetPopularVideos(),
  ]);

  vRecentArchive.data.hits.hits.forEach((hit) =>
    signFileURLs(hit._source.drive_base, hit._source.files, ip)
  );
  vRecentUpload.data.hits.hits.forEach((hit) =>
    signFileURLs(hit._source.drive_base, hit._source.files, ip)
  );
  vPopular.hits.hits.forEach((hit) =>
    signFileURLs(hit._source.drive_base, hit._source.files, ip)
  );

  const sections = [];
  if (vPopular.hits.total.value > 0)
    sections.push({ title: 'Trending videos', videos: vPopular });
  sections.push({ title: 'Recently uploaded', videos: vRecentUpload.data });
  sections.push({
    title: 'Recently archived',
    videos: vRecentArchive.data,
  });

  return {
    stats,
    sections,
  };
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { stats, sections } = await getPageProps(null);
  return {
    props: {
      stats,
      videos: sections,
    },
  };
};

export default LandingPage;
