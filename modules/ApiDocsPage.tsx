import Head from 'next/head';
import { ApiSearchSortFields } from '../pages/api/v1/search';
import PageBase from './shared/PageBase';

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
          our archive. The following is a summary of the available endpoints.
          For more details, check out{' '}
          <a
            target="_blank"
            rel="noreferrer noopener nofollow"
            href="https://github.com/ragtag-archive/archive-browser"
          >
            the source code
          </a>
          .
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
        <h2>Embedding videos</h2>
        <p>
          Videos from this website can be embedded with the URL{' '}
          <code>/embed/:videoId</code>. For example,
        </p>
        <pre>
          <code>{`<div style="position:relative;padding-bottom:56.25%">
  <iframe
    frameborder="0"
    allow="fullscreen"
    src="https://archive.ragtag.moe/embed/vHMV44Uza4g"
    style="position:absolute;width:100%;height:100%" />
</div>`}</code>
        </pre>
        <p>
          will create a responsive iframe with a 16:9 aspect ratio like the
          following:
        </p>
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <iframe
            frameBorder="0"
            allow="fullscreen"
            src="/embed/vHMV44Uza4g"
            className="absolute w-full h-full"
          />
        </div>
        <p>Note that chat replay is not yet available for embedded videos.</p>
      </div>
    </PageBase>
  );
};

export default ApiDocsPage;
