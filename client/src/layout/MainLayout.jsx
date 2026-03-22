import { Outlet, useLocation } from 'react-router-dom';
import { MainHeader } from './MainHeader.jsx';

export function MainLayout() {
  const { pathname } = useLocation();
  const isConfigurator = pathname === '/configurator';

  if (isConfigurator) {
    return (
      <div className="relative h-dvh max-h-dvh overflow-hidden flex flex-col bg-slate-900 text-slate-100">
        <main className="absolute inset-0 z-0 min-h-0">
          <Outlet />
        </main>
        <MainHeader overlay />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <MainHeader />
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}

