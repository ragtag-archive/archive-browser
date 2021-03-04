import React from "react";
import { useRouter } from "next/router";
import { useAmplitude } from "./libs/amplitude/useAmplitude";

const AmplitudePageView = () => {
  const { logEvent } = useAmplitude();
  const router = useRouter();

  const logPageView = () =>
    logEvent("page_view", {
      route: router.route,
      query: router.query,
    });

  React.useEffect(() => {
    logPageView();
  }, [router.route]);

  return null;
};

export default AmplitudePageView;
