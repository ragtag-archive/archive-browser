import Head from "next/head";
import React from "react";
import PageBase from "./shared/PageBase";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { NEXT_PUBLIC_HCAPTCHA_SITE_KEY } from "./shared/config";
import axios from "axios";
import Link from "next/link";

export type BulkRequestPageProps = {};

const url2Id = (url: string): string => {
  let videoId = "";
  try {
    const parsedURL = new URL(url);
    if (parsedURL.hostname === "youtu.be")
      videoId = parsedURL.pathname.substr(1);
    else if (
      (parsedURL.hostname === "youtube.com" ||
        parsedURL.hostname === "www.youtube.com") &&
      parsedURL.pathname === "/watch"
    )
      videoId = parsedURL.searchParams.get("v");
    else throw new Error("Unsupported URL");
  } catch (ex) {}
  return videoId;
};

const BulkRequestPage = (props: BulkRequestPageProps) => {
  const [videoURLs, setVideoURLs] = React.useState("");
  const [jwt, setJWT] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const extractIds = () =>
    videoURLs
      .split("\n")
      .map(url2Id)
      .filter((id: string) => id.length === 11);

  React.useEffect(() => {
    if (!videoURLs) return setMessage("");
    const n = extractIds().length;
    setMessage("Detected " + n + " videos");
  }, [videoURLs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    setMessage("");

    if (!jwt) {
      setError("JWT is required");
      setIsSubmitting(false);
      return;
    }

    /**
     * Extract video ID
     */
    const videos = extractIds();

    const res = await axios
      .request({
        method: "post",
        url: "/api/request",
        params: {
          jwt,
        },
        data: { videos },
      })
      .then((response) => response.data)
      .catch(({ response }) => response.data);

    setIsSubmitting(false);
    if (res.ok) setMessage(res.message);
    else setError(res.message);
  };

  return (
    <PageBase>
      <Head>
        <title>Bulk Archival Request - Ragtag Archive</title>
      </Head>
      <div>
        <div className="px-4 max-w-xl mx-auto">
          <h1 className="text-3xl mt-16 text-center">Bulk request</h1>
          <p className="text-lg text-center mb-16">
            This form is meant for internal use. Send !auth to request JWT.
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="YouTube Video URLs (one per line)"
              className="
                w-full rounded px-4 py-1
                bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
                transition duration-100"
              onChange={(e) => setVideoURLs(e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="text"
              placeholder="JWT / Authorization code"
              className="
                w-full rounded px-4 py-1
                bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
                transition duration-100"
              disabled={isSubmitting}
              onChange={(e) => setJWT(e.target.value)}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                my-4
                bg-gray-800
                hover:bg-gray-700
                focus:bg-gray-900 focus:outline-none
                px-4 py-2 mr-2 rounded
                transition duration-200
                disabled:text-gray-400 disabled:bg-gray-600 disabled:pointer-events-none
              "
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            <Link href="/request">
              <a>Normal mode</a>
            </Link>
            <p className="text-red-500">{error}</p>
            <p className="">{message}</p>
          </form>
        </div>
      </div>
    </PageBase>
  );
};

export default BulkRequestPage;
