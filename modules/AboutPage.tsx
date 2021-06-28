import Head from "next/head";
import PageBase from "./shared/PageBase";

const AboutPage = () => {
  return (
    <PageBase>
      <Head>
        <title>About - Ragtag Archive</title>
      </Head>
      <div className="prose prose-lg prose-dark px-6 py-12">
        <h1>Welcome to the archives</h1>
        <p>
          This website aims to back up as much Virtual YouTuber content as
          possible, mainly from Hololive. We back up (almost) everything
          available on the YouTube video page, including the thumbnail,
          description, chat logs, and captions (if available). All videos are
          archived at the highest quality available.
        </p>
        <p>
          We only back up publicly available content. This means you won't find
          unarchived streams and members-only content here.
        </p>
        <p>
          This project started on February 20th, 2021. Any videos that are
          already gone by that date won't be available here. We're currently not
          accepting video files for content that's already gone.
        </p>
        <p>
          If you have any questions or concerns, feel free to hop on the{" "}
          <a
            target="_blank"
            rel="noreferrer noopener nofollow"
            href="https://ragtag.link/discord"
          >
            Aonahara Discord
          </a>{" "}
          and ping <code>kitsune#0156</code> in the{" "}
          <code>#tech-and-programming</code> channel.
        </p>
        <p>
          This project is open source! Forking the project and running your own
          instance is highly encouraged. Check out the source code{" "}
          <a
            target="_blank"
            rel="noreferrer noopener nofollow"
            href="https://gitlab.com/aonahara/archive-browser"
          >
            here
          </a>
          .
        </p>
        <p>Enjoy!</p>
      </div>
    </PageBase>
  );
};

export default AboutPage;
