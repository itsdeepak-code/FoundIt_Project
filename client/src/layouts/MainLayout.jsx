import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  const { pathname } = useLocation();

  // Start each new page at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Centered page container with an optional heading row. */
export function Page({ title, subtitle, actions, back, children, narrow = false }) {
  return (
    <div className={`mx-auto w-full px-4 py-8 sm:px-6 sm:py-10 ${narrow ? 'max-w-3xl' : 'max-w-6xl'}`}>
      {back}
      {(title || actions) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>}
            {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
