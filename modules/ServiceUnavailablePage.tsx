import React from "react";
import DefaultHead from "./shared/DefaultHead";
import PageBase from "./shared/PageBase";

const ServiceUnavailablePage = () => (
  <PageBase>
    <DefaultHead title="Service temporarily unavailable" />
    <div className="px-4">
      <h1 className="text-3xl mt-16 text-center">
        Service temporarily unavailable
      </h1>
      <p className="text-lg text-center">Come back in a minute or two.</p>
    </div>
  </PageBase>
);

export default ServiceUnavailablePage;
