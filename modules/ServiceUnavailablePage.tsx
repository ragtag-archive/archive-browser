import Link from 'next/link';
import React from 'react';
import DefaultHead from './shared/DefaultHead';
import PageBase from './shared/PageBase';

const ServiceUnavailablePage = () => (
  <PageBase>
    <DefaultHead title="Service temporarily unavailable" />
    <div className="px-4">
      <h1 className="text-3xl mt-16 text-center">
        Service temporarily unavailable
      </h1>
      <p className="text-lg text-center">Come back in a minute or two.</p>
      <div className="flex w-full mt-2 items-center justify-center">
        <Link
          href="/status"
          className="
              bg-gray-800
              hover:bg-gray-700
              focus:bg-gray-900 focus:outline-none
              px-4 py-2 md:mr-2 mb-2 md:mb-0 rounded
              transition duration-200
              flex flex-row items-center
            "
        >
          Status
        </Link>
      </div>
    </div>
  </PageBase>
);

export default ServiceUnavailablePage;
