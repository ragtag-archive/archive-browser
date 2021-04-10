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
        <h2>Searching</h2>
        <h3>Basic Search</h3>
        <pre>
          <code>GET /api/v1/search</code>
        </pre>
        <h4>Query parameters</h4>
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
        <h4>Example</h4>
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
        <h2>Live updates</h2>
        <p>
          We also provide a simple websocket service for listening to events at
          the following address:
        </p>
        <pre>
          <code>wss://ws.ragtag.moe</code>
        </pre>
        To listen to events, connect to the socket and send the following
        message:
        <pre>
          <code>
            {JSON.stringify({
              method: "subscribe",
              params: ["moe.ragtag.archive:workers", "ping"],
            })}
          </code>
        </pre>
        The above message subscribes you to two topics. The <code>ping</code>{" "}
        topic will deliver a message once every <code>5</code> seconds to keep
        the connection alive. The <code>moe.ragtag.archive:workers</code> topic
        will deliver events from our workers. You will receive messages in the
        following format:
        <pre>
          <code>
            {JSON.stringify(
              {
                id: -1,
                result: [
                  "moe.ragtag.archive:workers",
                  {
                    event: "<event type>",
                    data: "<event data>",
                    source: "<worker id>",
                    version: "<worker version>",
                  },
                ],
              },
              null,
              2
            )}
          </code>
        </pre>
        <p>The following event types are available:</p>
        <table>
          {Object.entries({
            work_begin: "worker has accepted a job from the queue",
            work_end:
              "worker has cleanly finished a job and will request a new one",
            work_failed:
              "something went wrong while doing a job, and the job will be requeued",
            video_downloading: "worker is downloading the video from YouTube",
            video_failed:
              "worker could not download the video, the job is discarded and will not be requeued",
            video_uploading:
              "worker has started uploading the video to the site storage",
            video_uploaded:
              "all video files have been uploaded but the database has not been updated yet",

            worker_updated:
              "worker has downloaded a newer version of its software and will run that version on the next job",
            rate_limit:
              "worker has detected a HTTP 429 and will rest for one hour",
          }).map(([k, v]) => (
            <tr>
              <td>
                <code>{k}</code>
              </td>
              <td>{v}</td>
            </tr>
          ))}
        </table>
        <p>Notes</p>
        <ul>
          {[
            "this endpoint is currently unauthenticated, anyone can publish any event",
            <>
              when a worker detects a video is already present on the website,
              it will do nothing and emit <code>work_end</code>
            </>,
          ].map((x) => (
            <li>{x}</li>
          ))}
        </ul>
      </div>
    </PageBase>
  );
};

export default ApiDocsPage;
