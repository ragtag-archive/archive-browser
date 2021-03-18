import Head from "next/head";
import Link from "next/link";
import { ApiSearchSortFields } from "../pages/api/v1/search";
import PageBase from "./shared/PageBase";

const ApiDocsPage = () => {
  return (
    <PageBase>
      <Head>
        <title>API - Ragtag Archive</title>
      </Head>
      <div className="prose prose-lg prose-dark px-6 py-12">
        <h1>API Documentation</h1>
        <p>
          We provide a publicly accessible API to query the data available in
          our archive.
        </p>
        <h2>Basic Search</h2>
        <pre>
          <code>GET /api/v1/search</code>
        </pre>
        <h3>Query parameters</h3>
        <table>
          <tr>
            <td>
              <code>q</code>
            </td>
            <td>search query, just like using the search bar</td>
          </tr>
          <tr>
            <td>
              <code>v</code>
            </td>
            <td>find one video with the given video id</td>
          </tr>
          <tr>
            <td>
              <code>channel_id</code>
            </td>
            <td>find videos that belong to the given channel id</td>
          </tr>

          <tr>
            <td>
              <code>sort</code>
            </td>
            <td>
              sort field, can be one of
              <ul>
                {ApiSearchSortFields.map((field) => (
                  <li>
                    <code>{field}</code>
                  </li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <td>
              <code>sort_order</code>
            </td>
            <td>
              either <code>asc</code> or <code>desc</code>
            </td>
          </tr>

          <tr>
            <td>
              <code>from</code>
            </td>
            <td>offset results for pagination</td>
          </tr>
          <tr>
            <td>
              <code>size</code>
            </td>
            <td>number of results to show in one page</td>
          </tr>
        </table>
        <h3>Example</h3>
        <ul>
          <li>
            <p>
              Search for <code>haachama</code>, and sort results by video
              duration from longest to shortest.
            </p>
            <pre>
              <code>
                {`curl https://archive.ragtag.moe/api/v1/search?q=haachama&sort=duration&sort_order=desc`}
              </code>
            </pre>
          </li>
        </ul>

        <h2>Raw Search</h2>
        <pre>
          <code>POST /api/v1/search</code>
        </pre>
        <h3>Headers</h3>
        <table>
          <tr>
            <td>
              <code>Content-Type</code>
            </td>
            <td>
              <code>application/json</code>
            </td>
          </tr>
        </table>
        <h3>Body</h3>
        <p>
          Any valid{" "}
          <a
            target="_blank"
            rel="noreferrer noopener nofollow"
            href="https://www.elastic.co/guide/en/elasticsearch/reference/7.9/query-dsl.html"
          >
            Elasticsearch 7.9 Query DSL
          </a>
          .
        </p>
        <h3>Example</h3>
        <ul>
          <li>
            <p>
              Aggregate the total file size of all videos in{" "}
              <Link href="/channel/UCwQ9Uv-m8xkE5PzRc7Bqx3Q">
                <a>Otogibara Era's channel</a>
              </Link>
              .
            </p>
            <pre>
              <code>
                {JSON.stringify(
                  {
                    query: {
                      match: {
                        channel_id: "UCwQ9Uv-m8xkE5PzRc7Bqx3Q",
                      },
                    },
                    size: 0,
                    aggs: {
                      totalsize: {
                        nested: {
                          path: "files",
                        },
                        aggs: {
                          files_size: {
                            sum: {
                              field: "files.size",
                            },
                          },
                        },
                      },
                    },
                  },
                  null,
                  2
                )}
              </code>
            </pre>
          </li>
          <li>
            <p>
              Find other videos related to the video with ID{" "}
              <Link href="/watch?v=DQ4uAsrXOUE">
                <a>
                  <code>DQ4uAsrXOUE</code>
                </a>
              </Link>
              , using the fields <code>title</code>, <code>description</code>,
              and <code>channel_name</code> to do the matching.
            </p>
            <pre>
              <code>
                {JSON.stringify(
                  {
                    query: {
                      more_like_this: {
                        fields: ["title", "description", "channel_name"],
                        like: [
                          {
                            _index: "youtube-archive",
                            _id: "DQ4uAsrXOUE",
                          },
                        ],
                      },
                    },
                  },
                  null,
                  2
                )}
              </code>
            </pre>
          </li>
        </ul>
      </div>
    </PageBase>
  );
};

export default ApiDocsPage;
