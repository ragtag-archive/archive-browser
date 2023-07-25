import { GetServerSideProps } from 'next';
import ChatExplorerPage from '../../modules/ChatExplorerPage';
import { signFileURLs } from '../../modules/shared/fileAuth';
import { getRemoteAddress } from '../../modules/shared/util';
import { apiSearch } from '../api/v1/search';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const v = ctx.query.v as string;
    if (!v) return { notFound: true };

    const _searchResult = await apiSearch({ v });
    if (_searchResult.data.hits.total.value === 0) return { notFound: true };
    const video = _searchResult.data.hits.hits[0]._source;

    const ip = getRemoteAddress(ctx.req);
    signFileURLs(video.drive_base, video.files, ip);

    const chatFile = video.files.find(
      (file) =>
        file.name.endsWith('.chat.json') ||
        file.name.endsWith('.live_chat.json')
    );
    const thumbFile = video.files.find((file) => file.name.endsWith('.webp'));

    if (!chatFile) return { notFound: true };

    return {
      props: {
        chatURL: chatFile.url,
        thumbnailURL: thumbFile.url,
        title: video.title,
        v,
      },
    };
  } catch (ex) {
    return { props: {} };
  }
};

export default ChatExplorerPage;
