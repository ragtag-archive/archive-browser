import React from "react";
import {apiListChannels} from "./api/v1/channels";

class Sitemap extends React.Component {
  static async getInitialProps({ res }) {
    const channels = await apiListChannels()

    res.setHeader("Content-Type", "text/xml");
    res.write((posts));
    res.end();
  }
}

export default Sitemap;
