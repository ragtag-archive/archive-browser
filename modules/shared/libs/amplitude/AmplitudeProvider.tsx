import React from "react";
import AmplitudeContext from "./AmplitudeContext";

const AmplitudeProvider = (props: any) => {
  const logEvent = (eventName: string, eventProperties?: any) => {
    if (typeof window !== "undefined") {
      try {
        const amplitude = require("amplitude-js");
        amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_KEY, undefined, {});
        amplitude.setVersionName(process.env.NEXT_PUBLIC_APP_VERSION);
        amplitude.logEvent(eventName, eventProperties);
      } catch (ex) {}
    }
  };

  return (
    <AmplitudeContext.Provider
      value={{
        logEvent,
      }}
      {...props}
    />
  );
};

export default AmplitudeProvider;
