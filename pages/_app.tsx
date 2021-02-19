import SearchProvider from "../modules/shared/hooks/search/SearchProvider";
import "../styles/tailwind.css";

function MyApp({ Component, pageProps }) {
  return (
    <SearchProvider>
      <Component {...pageProps} />
    </SearchProvider>
  );
}

export default MyApp;
