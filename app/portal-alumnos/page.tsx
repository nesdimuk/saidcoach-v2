'use client';

import { useEffect } from "react";

export default function PortalAlumnos() {
  useEffect(() => {
    const configScript = document.createElement("script");
    configScript.innerHTML = `
      var ptd_param = {};
      ptd_param.apk = "faxisP2zww171433";
      ptd_param.domain = "https://v3portal.ptdistinction.com";
    `;

    const loaderScript = document.createElement("script");
    loaderScript.src =
      "https://v3portal.ptdistinction.com/v3/inside/integration/v1/portal.js?id=de9dd06362de656c46b67fdf38dd3a24";
    loaderScript.async = true;

    document.body.append(configScript, loaderScript);

    return () => {
      configScript.remove();
      loaderScript.remove();
    };
  }, []);

  return (
    <div className="bg-brand-white px-4 py-12 text-brand-black">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-center">Portal de Alumnos</h1>
        <div id="ptd_portal" />
      </div>
    </div>
  );
}
