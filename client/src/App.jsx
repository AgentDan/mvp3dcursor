import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from './features/home';
import { ConfiguratorPage } from './features/configurator';
import { LoginPage, RegisterPage } from './features/auth';
import { AdminLayout, AdminDashboard, AdminRegister } from './features/admin';
import { ModelsAdmin } from './features/models';
import TempGlassMenuExample from './features/admin/components/TempGlassMenuExample.jsx';
import { MainLayout } from './layout/MainLayout.jsx';

function App() {
  const location = useLocation();
  const prevLocationRef = useRef({ pathname: location.pathname, search: location.search });

  // Drop Lab temp file only when leaving the configurator route, not when a child unmounts (Strict Mode).
  useEffect(() => {
    const prev = prevLocationRef.current;
    const currPath = location.pathname;
    const currSearch = location.search;
    if (prev.pathname === '/configurator' && currPath !== '/configurator') {
      const params = new URLSearchParams(prev.search);
      const labKey = params.get('labKey');
      if (labKey && labKey.trim()) {
        fetch('/api/admin/lab/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: labKey.trim() }),
        }).catch(() => {});
      }
    }
    prevLocationRef.current = { pathname: currPath, search: currSearch };
  }, [location.pathname, location.search]);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/configurator" element={<ConfiguratorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="register" element={<AdminRegister />} />
        <Route path="models" element={<ModelsAdmin />} />
        <Route path="temp-glass-menu" element={<TempGlassMenuExample />} />
      </Route>
    </Routes>
  );
}

export default App;
