import React from 'react';
import Linkify from 'react-linkify';
import Head from 'next/head';
import { apiStatusMessage, WorkerStatus } from '../pages/api/v1/status';
import { format } from 'timeago.js';
import PageBase from './shared/PageBase';

type StatusCardProps = {
  title: string;
  ok: boolean | null;
  statusText: string;

  videoId?: string;
  timestamp?: number;
};

const StatusCard = (props: StatusCardProps) => {
  return (
    <div className="border-b border-gray-700 px-6 py-4">
      <div className="flex flex-row justify-between">
        <div className="font-bold">{props.title}</div>
        <div
          className={
            props.ok === null
              ? ''
              : props.ok
              ? 'text-green-500'
              : 'text-red-500'
          }
        >
          {props.statusText}
        </div>
      </div>
      {props.videoId && (
        <div className="text-gray-500 flex flex-row justify-between">
          <span>
            Last worked on{' '}
            <a
              href={'https://youtu.be/' + props.videoId}
              target="_blank"
              rel="noreferrer noopener nofollow"
              className="text-gray-400"
            >
              {props.videoId}
            </a>
          </span>
          <span>{props.timestamp && format(props.timestamp)}</span>
        </div>
      )}
    </div>
  );
};

const K_EVENT_TEXT = {
  work_begin: 'Archiving video',
  work_end: 'Video successfully archived',
  work_failed: 'Archival failed',
  video_downloading: 'Downloading video',
  video_failed: 'Error downloading video',
  video_downloaded: 'Video downloaded',
  video_uploading: 'Uploading video',
  video_uploaded: 'Video uploaded',

  worker_updated: 'Worker updated itself',
  rate_limit: 'Rate limited, will retry in an hour',
};

const StatusPage = () => {
  const [time, setTime] = React.useState(Date.now());
  const [statusMessage, setStatusMessage] = React.useState('');
  const [refreshMessage, setRefreshMessage] = React.useState('Loading...');
  const [status, setStatus] = React.useState<StatusCardProps[]>([
    { title: 'Loading...', ok: null, statusText: '' },
  ]);

  const fetchStatus = async () => {
    const stat: StatusCardProps[] = [
      { title: 'Website', ok: true, statusText: 'Online' },
    ];

    // Grab status message
    const { message } = await apiStatusMessage();
    setStatusMessage(message);

    // Database status
    const fileURL = await fetch('/api/v1/search')
      .then((res) => res.json())
      .then((res) => {
        if (res && res.timed_out === false && res.hits.hits.length > 0) {
          stat.push({ title: 'Database', ok: true, statusText: 'Online' });
          return (
            '/' +
            res.hits.hits[0]._id +
            '/' +
            res.hits.hits[0]._source.files?.[0]?.name
          );
        }
      })
      .catch(() => {
        stat.push({ title: 'Database', ok: false, statusText: 'Error' });
        return '/_/benchmark/ok.json';
      });

    /*
    // CF cache
    await fetch(DRIVE_BASE_URL + fileURL)
      .then((res) => res.json())
      .then((res) => {
        stat.push({
          title: "Content server",
          ok: true,
          statusText: "Online",
        });
      })
      .catch((d) => {
        console.log(d);
        stat.push({
          title: "Content server",
          ok: false,
          statusText: "Error",
        });
      });
    */

    // Worker status
    await fetch('/api/v1/status')
      .then((res) => res.json())
      .then((res: WorkerStatus[]) => {
        const active = res.filter((s) => s.event !== 'rate_limit').length;
        stat.push({
          title: 'Workers',
          ok: null,
          statusText: `${active}/${res.length} active`,
        });

        res.forEach((s) =>
          stat.push({
            title: 'Worker ' + s.source,
            ok: ['rate_limit', 'work_failed', 'video_failed'].includes(s.event)
              ? false
              : ['video_uploaded', 'video_downloaded', 'work_end'].includes(
                  s.event
                )
              ? true
              : null,
            statusText: K_EVENT_TEXT[s.event],
            videoId: s.data.video_id,
            timestamp: s.timestamp,
          })
        );
      })
      .catch(() =>
        stat.push({ title: 'Workers', ok: false, statusText: 'Error' })
      );

    setStatus(stat);
  };

  React.useEffect(() => {
    if (Math.floor(time / 1000) % 10 === 0) {
      fetchStatus();
      setRefreshMessage('Reloading...');
      return;
    }

    const timeLeft = 10 - (Math.floor(time / 1000) % 10);
    setRefreshMessage('Reloading in ' + timeLeft);
  }, [time]);

  React.useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageBase>
      <Head>
        <title>Status Page - Ragtag Archive</title>
      </Head>
      <div className="max-w-xl mx-auto">
        <div className="px-4 pb-6">
          <h1 className="text-3xl mt-16 text-center">Service Status</h1>
          <p className="text-lg text-center">{refreshMessage}</p>
        </div>
        <div className="bg-gray-900 p-4 mb-6 rounded">
          <Linkify
            componentDecorator={(href, text, key) => (
              <a
                key={key}
                href={href}
                className="text-white underline"
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                {text}
              </a>
            )}
          >
            {statusMessage}
          </Linkify>
        </div>

        {status.map((stat) => (
          <StatusCard key={stat.title} {...stat} />
        ))}
      </div>
    </PageBase>
  );
};

export default StatusPage;
