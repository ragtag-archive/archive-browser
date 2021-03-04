import React from "react";

type AmplitudeContextType = {
  logEvent: (eventName: string, eventProperties?: any) => any;
};

const AmplitudeContext = React.createContext<AmplitudeContextType>({
  logEvent: (eventName: string, eventProperties?: any) => null,
});

export default AmplitudeContext;
