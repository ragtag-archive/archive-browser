import { GetServerSideProps } from "next";
import ChatExplorerPage from "../../modules/ChatExplorerPage";
import { DRIVE_BASE_URL } from "../../modules/shared/config";
import { signURL } from "../../modules/shared/fileAuth";
import { getRemoteAddress } from "../../modules/shared/util";
import { apiSearch } from "../api/v1/search";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const v = ctx.query.v as string;
    if (!v) return { notFound: true };

    const _searchResult = await apiSearch({ v });
    if (_searchResult.data.hits.total.value === 0) return { notFound: true };
    const video = _searchResult.data.hits.hits[0]._source;

    const chatFile = video.files.find((file) =>
      file.name.endsWith(".chat.json")
    );
    if (!chatFile) return { notFound: true };

    const ip = getRemoteAddress(ctx.req);
    const chatURL = signURL(
      chatFile.url ||
        DRIVE_BASE_URL +
          "/" +
          chatFile.name.split(".")[0] +
          "/" +
          chatFile.name,
      ip
    );
    return {
      props: {
        chatURL,
        v,
      },
    };
  } catch (ex) {
    return { props: {} };
  }
};

export default ChatExplorerPage;
