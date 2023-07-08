import React from 'react';
import Head from 'next/head';
import axios from 'axios';
import { DRIVE_BASE_URL } from './shared/config';
import PageBase from './shared/PageBase';
import { formatBytes } from './shared/format';
import { useThrottle } from './shared/hooks/useThrottle';

const SpeedTestPage = () => {
  const testFile = DRIVE_BASE_URL + '/_/benchmark/100M.bin';
  const testFileSize = 104857600;

  const [isTestRunning, setIsTestRunning] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(0);
  const [speed, setSpeed] = React.useState('');
  const [unit, setUnit] = React.useState('');

  const startTime = React.useRef(0);

  const onDownloadProgress = (progressEvent: any) => {
    if (startTime.current === 0) return (startTime.current = Date.now());
    const { loaded } = progressEvent;
    const bytesPerSecond = loaded / ((Date.now() - startTime.current) / 1000);
    const [_speed, _unit] = formatBytes(bytesPerSecond).split(' ');

    setSpeed(Number(_speed).toFixed(2));
    setUnit(_unit + 'ps');
    setDownloaded(loaded);
  };

  const throttledSpeed = useThrottle(speed, 1000);
  React.useEffect(() => {
    try {
      if (isNaN(throttledSpeed)) return;
    } catch (ex) {
      console.error(ex);
    }
  }, [throttledSpeed, unit]);

  const beginTest = () => {
    setIsTestRunning(true);
    setSpeed('Starting...');
    setUnit('');
    setDownloaded(0);
    startTime.current = 0;
    axios
      .get(testFile, {
        onDownloadProgress,
      })
      .catch((e) => {
        setUnit('');
        setSpeed(e.message || 'Error');
      })
      .finally(() => setIsTestRunning(false));
  };

  return (
    <PageBase>
      <Head>
        <title>Speed Test - Ragtag Archive</title>
      </Head>
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex flex-row items-start font-mono">
          <h1 className="text-6xl">{speed}</h1>
          <p className="text-2xl">{unit}</p>
        </div>
        {isTestRunning ? (
          <p className="font-mono">
            {((100 * downloaded) / testFileSize).toFixed(0)}% complete
          </p>
        ) : (
          <div className="flex flex-col items-center">
            <button
              className="
              bg-gray-800
              hover:bg-gray-700
              focus:bg-gray-900 focus:outline-none
              px-4 py-2 md:mr-2 mb-2 md:mb-0 rounded
              transition duration-200
              flex flex-row items-center
            "
              type="button"
              onClick={beginTest}
            >
              Begin test
            </button>
            <p className="mt-2 text-gray-400">
              The test will download a 100MiB file
            </p>
          </div>
        )}
      </div>
    </PageBase>
  );
};

export default SpeedTestPage;
