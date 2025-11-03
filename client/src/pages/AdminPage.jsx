import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import api from '../lib/api';
import ClubManager from '../components/admin/ClubManager';
import StudentImporter from '../components/admin/StudentImporter';
import EnrollmentManager from '../components/admin/EnrollmentManager';
import InscripcionesToggle from '../components/admin/InscripcionesToggle';
import './AdminPage.css';

const TABS = [
  { id: 'clubs', label: 'Clubs' },
  { id: 'estudiantes', label: 'Estudiantes habilitados' },
  { id: 'inscripciones', label: 'Inscripciones' },
];

export default function AdminPage() {
  const { adminCode, setAdminCode, clearAdminCode } = useAdmin();
  const [inputCode, setInputCode] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const handleAccess = async (event) => {
    event.preventDefault();
    if (!inputCode.trim()) {
      setLoginError('Ingresa el código proporcionado.');
      return;
    }
    setLoading(true);
    setLoginError(null);
    try {
      setAdminCode(inputCode.trim());
      await api.get('/api/admin/ping');
    } catch (err) {
      clearAdminCode();
      const message = err.response?.data?.message || 'Código no válido';
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminCode();
    setInputCode('');
  };

  if (!adminCode) {
    return (
      <div className="admin-access">
        <form className="access-card" onSubmit={handleAccess}>
          <h1>Gestión de clubs</h1>
          <p>Ingrese el código de acceso autorizado para administrar los clubs.</p>
          <label htmlFor="admin-code">
            Código de acceso
            <input
              id="admin-code"
              type="password"
              value={inputCode}
              onChange={(event) => setInputCode(event.target.value)}
              placeholder="Código"
            />
          </label>
          {loginError && <p className="feedback feedback--error">{loginError}</p>}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Administración de clubs temáticos</h1>
          <p>Gestiona los clubs, estudiantes habilitados e inscripciones.</p>
        </div>
        <nav className="dashboard-actions">
          <Link className="secondary-button" to="/reporte-inscripciones">
            Ver reportes
          </Link>
          <button type="button" onClick={handleLogout} className="secondary-button">
            Salir
          </button>
        </nav>
      </header>

      <nav className="dashboard-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? 'tab-button tab-button--active' : 'tab-button'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="dashboard-content">
        <InscripcionesToggle />
        {activeTab === 'clubs' && <ClubManager />}
        {activeTab === 'estudiantes' && <StudentImporter />}
        {activeTab === 'inscripciones' && <EnrollmentManager />}
      </section>
    </div>
  );
}
