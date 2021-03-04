import NProgress from "nprogress";
import Router from "next/router";
import "../styles/tailwind.css";
import "../styles/player.css";
import "nprogress/nprogress.css";
import AmplitudeProvider from "../modules/shared/libs/amplitude/AmplitudeProvider";
import AmplitudePageView from "../modules/shared/AmplitudePageView";

NProgress.configure({
  showSpinner: false,
  trickle: true,
});

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }) {
  return (
    <AmplitudeProvider>
      <AmplitudePageView />
      <Component {...pageProps} />
    </AmplitudeProvider>
  );
}

export default MyApp;
