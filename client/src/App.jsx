import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import HomePage from './pages/HomePage';
import SedeClubsPage from './pages/SedeClubsPage';
import AdminPage from './pages/AdminPage';
import ReportsPage from './pages/ReportsPage';
import EnrollmentLookupPage from './pages/EnrollmentLookupPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sede/:sedeSlug" element={<SedeClubsPage />} />
            <Route path="/gestionclubs" element={<AdminPage />} />
            <Route path="/consulta-inscripcion" element={<EnrollmentLookupPage />} />
            <Route path="/reporte-inscripciones" element={<ReportsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AdminProvider>
  );
}
