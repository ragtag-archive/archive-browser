import Head from "next/head";
import React from "react";
import PageBase from "./shared/PageBase";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { NEXT_PUBLIC_HCAPTCHA_SITE_KEY } from "./shared/config";
import axios from "axios";
import Link from "next/link";
import { useAmplitude } from "./shared/libs/amplitude/useAmplitude";
import { K_AMPLITUDE_EVENT_ARCHIVAL_REQUEST } from "./shared/libs/amplitude/constants";

export type RequestPageProps = {};

const RequestPage = (props: RequestPageProps) => {
  const [videoURL, setVideoURL] = React.useState(null);
  const [captchaCode, setCaptchaCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { logEvent } = useAmplitude();

  const captchaRef = React.useRef<HCaptcha>(null);

  const handleCaptchaVerify = (code) => {
    setCaptchaCode(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    setMessage("");

    /**
     * Extract video ID
     */
    let videoId = "";
    try {
      const parsedURL = new URL(videoURL);
      if (parsedURL.hostname === "youtu.be")
        videoId = parsedURL.pathname.substr(1);
      else if (
        (parsedURL.hostname === "youtube.com" ||
          parsedURL.hostname === "www.youtube.com") &&
        parsedURL.pathname === "/watch"
      )
        videoId = parsedURL.searchParams.get("v");
      else throw new Error("Unsupported URL");
    } catch (ex) {
      setError("Invalid URL");
      setIsSubmitting(false);
      captchaRef.current?.resetCaptcha();
      return false;
    }

    if (!captchaCode) {
      setError("Invalid captcha");
      setIsSubmitting(false);
      captchaRef.current?.resetCaptcha();
      return false;
    }

    const res = await axios
      .request({
        method: "get",
        url: "/api/request",
        params: {
          v: videoId,
          captcha: captchaCode,
        },
      })
      .then((response) => response.data)
      .catch(({ response }) => response.data);

    setIsSubmitting(false);
    captchaRef.current?.resetCaptcha();
    if (res.ok) setMessage(res.message);
    else setError(res.message);

    logEvent(K_AMPLITUDE_EVENT_ARCHIVAL_REQUEST, {
      ...res,
      videoId,
    });
  };

  return (
    <PageBase>
      <Head>
        <title>Archival Request - Ragtag Archive</title>
      </Head>
      <div>
        <div className="px-4 max-w-xl mx-auto">
          <h1 className="text-3xl mt-16 text-center">Archival request</h1>
          <p className="text-lg text-center mb-16">
            If you have a video that hasn't been archived here yet, you can
            request it to be archived below. Your video will be queued and
            processed as soon as possible.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="YouTube Video URL"
              className="
                w-full rounded px-4 py-1
                bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring
                transition duration-100"
              onChange={(e) => setVideoURL(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="my-4">
              <HCaptcha
                ref={captchaRef}
                size="normal"
                sitekey={NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                onVerify={handleCaptchaVerify}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="
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
            <Link href="/request/bulk">
              <a>Bulk request</a>
            </Link>
            <p className="text-red-500">{error}</p>
            <p className="">{message}</p>
          </form>
        </div>
      </div>
    </PageBase>
  );
};

export default RequestPage;
