import React from "react";
import Head from "next/head";
import { WorkerStatus } from "../pages/api/v1/status";
import { DRIVE_BASE_URL } from "./shared/config";
import PageBase from "./shared/PageBase";

type StatusCardProps = {
  title: string;
  ok: boolean | null;
  statusText: string;
};

const StatusCard = (props: StatusCardProps) => {
  return (
    <div className="border-b border-gray-700 px-6 py-4">
      <div className="flex flex-row justify-between">
        <div className="font-bold">{props.title}</div>
        <div
          className={
            props.ok === null
              ? ""
              : props.ok
              ? "text-green-500"
              : "text-red-500"
          }
        >
          {props.statusText}
        </div>
      </div>
    </div>
  );
};

const StatusPage = () => {
  const [status, setStatus] = React.useState<StatusCardProps[]>([
    { title: "Loading...", ok: null, statusText: "" },
  ]);

  const fetchStatus = async () => {
    const stat = [{ title: "Website", ok: true, statusText: "Online" }];

    // Database status
    await fetch("/api/v1/search")
      .then((res) => res.json())
      .then((res) => {
        if (res && res.timed_out === false && res.hits.hits.length > 0)
          stat.push({ title: "Database", ok: true, statusText: "Online" });
      })
      .catch(() =>
        stat.push({ title: "Database", ok: false, statusText: "Error" })
      );

    // CF cache
    await fetch(DRIVE_BASE_URL + "/_/benchmark/ok.json")
      .then((res) => res.json())
      .then((res) => {
        if (!res.ok) throw new Error("Not ok");
        stat.push({
          title: "Content download",
          ok: true,
          statusText: "Online",
        });
      })
      .catch((d) => {
        console.log(d);
        stat.push({
          title: "Content download",
          ok: false,
          statusText: "Error",
        });
      });

    // Worker status
    await fetch("/api/v1/status")
      .then((res) => res.json())
      .then((res: WorkerStatus[]) => {
        const active = res.filter((s) => s.event !== "rate_limit").length;
        stat.push({
          title: "Workers",
          ok: null,
          statusText: `${active}/${res.length} active`,
        });

        res.forEach((s) =>
          stat.push({
            title: "Worker " + s.source,
            ok: s.event === "rate_limit" ? false : null,
            statusText: s.event + " " + s.data.video_id,
          })
        );
      })
      .catch(() =>
        stat.push({ title: "Workers", ok: false, statusText: "Error" })
      );

    setStatus(stat);
  };

  React.useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageBase>
      <Head>
        <title>Status Page - Ragtag Archive</title>
      </Head>
      <div className="max-w-xl mx-auto">
        <div className="px-4 pb-8">
          <h1 className="text-3xl mt-16 text-center">Service Status</h1>
        </div>

        {status.map((stat) => (
          <StatusCard key={stat.title} {...stat} />
        ))}
      </div>
    </PageBase>
  );
};

export default StatusPage;
