'use client';

import { useEffect } from 'react';

const SIGNUP_URL =
  'https://v3portal.ptdistinction.com/v3/inside/integration/stripePackageSignup/signup.js?id=469a7bdfadb0428ccc3a9cd88c65024a';

export default function AccesoAppPage() {
  useEffect(() => {
    if (window.__ptd_initialized__) return;
    window.__ptd_initialized__ = true;

    const inlineScript = document.createElement('script');
    inlineScript.type = 'text/javascript';
    inlineScript.innerHTML = `const ptd_param = {}; ptd_param.apk = "faxisP2zww171433"; ptd_param.domain = "https://v3portal.ptdistinction.com"; ptd_param.pkid = "45161";`;

    const externalScript = document.createElement('script');
    externalScript.src = SIGNUP_URL;
    externalScript.async = true;

    document.body.appendChild(inlineScript);
    document.body.appendChild(externalScript);

    return () => {
      inlineScript.remove();
      externalScript.remove();
      const portal = document.getElementById('ptd_signup_portal');
      if (portal) {
        portal.innerHTML = '';
      }
    };
  }, []);

  return (
    <section className="occim-card">
      <h1 className="occim-section-title">Acceso a la App</h1>
      <p>
        Para que vivas la experiencia completa OCCIM, crea tu cuenta y activa tu
        acceso personalizado. La app centraliza rutinas, seguimiento y
        recordatorios pensados exclusivamente para nuestros colaboradores.
      </p>

      <h2 className="occim-section-title" style={{ marginTop: '1.25rem' }}>
        Crear cuenta OCCIM
      </h2>

      <p className="occim-highlight" style={{ marginTop: '1.5rem' }}>
        Puedes completar el formulario directamente desde este portal:
      </p>
      <div id="ptd_signup_portal" style={{ marginTop: '1.5rem' }} />
    </section>
  );
}
