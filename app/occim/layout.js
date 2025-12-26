import Image from 'next/image';
import './estilos.css';

export const metadata = {
  title: 'Bienestar OCCIM',
  description: 'Portal corporativo exclusivo para colaboradores OCCIM',
};

export default function OccimLayout({ children }) {
  return (
    <div className="occim-body">
      <div className="occim-layout">
        <header className="occim-header">
          <Image
            src="/logo-occim.png"
            alt="Logo corporativo OCCIM"
            width={160}
            height={160}
            priority
          />
          <h1 className="occim-title">Bienestar OCCIM</h1>
        </header>

        <main className="occim-content">
          <div className="occim-content-inner">{children}</div>
        </main>

        <footer className="occim-footer">
          <strong>OCCIM · Cuidado integral para nuestros colaboradores</strong>
          <span>Este portal fue diseñado especialmente para nuestros colaboradores.</span>
        </footer>
      </div>
    </div>
  );
}
