import NProgress from "nprogress";
import Router from "next/router";
import SearchProvider from "../modules/shared/hooks/search/SearchProvider";
import "../styles/tailwind.css";
import "../styles/player.css";
import "nprogress/nprogress.css";

NProgress.configure({
  showSpinner: false,
  trickle: true,
});

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }) {
  return (
    <SearchProvider>
      <Component {...pageProps} />
    </SearchProvider>
  );
}

export default MyApp;
