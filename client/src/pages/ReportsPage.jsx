import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import './ReportsPage.css';

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { adminCode, setAdminCode, clearAdminCode } = useAdmin();
  const [sedes, setSedes] = useState([]);
  const [clubsBySede, setClubsBySede] = useState({});
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [accessError, setAccessError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const sedeParam = searchParams.get('sede') || '';
  const grupoParam = searchParams.get('grupo') || '';
  const clubParam = searchParams.get('club') || '';

  const clubsForSede = useMemo(
    () => clubsBySede[sedeParam] || [],
    [clubsBySede, sedeParam]
  );

  useEffect(() => {
    const loadSedes = async () => {
      const response = await api.get('/api/sedes');
      setSedes(response.data.data || []);
    };
    loadSedes();
  }, []);

  useEffect(() => {
    ensureClubs(sedeParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedeParam]);

  const ensureClubs = async (slug) => {
    if (!slug || clubsBySede[slug]) return;
    const response = await api.get(`/api/sedes/${slug}/clubs`);
    setClubsBySede((prev) => ({
      ...prev,
      [slug]: response.data.data?.clubs || [],
    }));
  };

  const loadReport = async () => {
    if (!authorized) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await ensureClubs(sedeParam);
      const response = await api.get('/api/reportes/inscripciones', {
        params: {
          sede: sedeParam || undefined,
          grupo: grupoParam || undefined,
          clubId: clubParam || undefined,
        },
      });
      setReport(response.data.data);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, sedeParam, grupoParam, clubParam]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleAccess = async (event) => {
    event.preventDefault();
    if (!inputCode.trim()) {
      setAccessError('Ingresa el código de acceso.');
      return;
    }
    setAccessError(null);
    setAdminCode(inputCode.trim());
    setInputCode('');
  };

  useEffect(() => {
    const validateCode = async () => {
      if (!adminCode) {
        setAuthorized(false);
        return;
      }
      setVerifying(true);
      try {
        await api.get('/api/admin/ping');
        setAuthorized(true);
        setAccessError(null);
      } catch (err) {
        const message = err.response?.data?.message || 'Código no válido';
        setAccessError(message);
        clearAdminCode();
        setAuthorized(false);
      } finally {
        setVerifying(false);
      }
    };
    validateCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminCode]);

  if (!authorized) {
    return (
      <div className="reports-access">
        <form className="reports-access-card" onSubmit={handleAccess}>
          <h1>Reporte de inscripciones</h1>
          <p>Ingresa el código autorizado para consultar el reporte general.</p>
          <label htmlFor="reports-code">
            Código de acceso
            <input
              id="reports-code"
              type="password"
              value={inputCode}
              onChange={(event) => setInputCode(event.target.value)}
              placeholder="Código"
              disabled={verifying}
            />
          </label>
          {accessError && <p className="feedback feedback--error">{accessError}</p>}
          <button type="submit" className="primary-button" disabled={verifying}>
            {verifying ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <header>
        <h1>Reporte de inscripciones</h1>
        <p>
          Filtra por sede, grupo o club. Esta vista es pública para compartir con los
          responsables.
        </p>
      </header>

      <div className="filters">
        <label htmlFor="report-sede">
          Sede
          <select
            id="report-sede"
            value={sedeParam}
            onChange={(event) => updateParam('sede', event.target.value)}
          >
            <option value="">Todas</option>
            {sedes.map((sede) => (
              <option key={sede.slug} value={sede.slug}>
                {sede.nombre}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="report-grupo">
          Grupo
          <input
            id="report-grupo"
            type="text"
            value={grupoParam}
            onChange={(event) => updateParam('grupo', event.target.value)}
            placeholder="Ej: 10A"
          />
        </label>

        <label htmlFor="report-club">
          Club
          <select
            id="report-club"
            value={clubParam}
            onChange={(event) => updateParam('club', event.target.value)}
          >
            <option value="">Todos</option>
            {clubsForSede.map((club) => (
              <option key={club.id} value={club.id}>
                {club.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p>Cargando reportes...</p>}
      {error && <p className="feedback feedback--error">{error}</p>}

      <div className="report-results">
        {report?.clubs?.map((club) => (
          <section key={club.clubId} className="report-card">
            <header>
              <h2>{club.clubNombre}</h2>
              <p>
                {club.sedeNombre} · Responsable: {club.clubResponsable} ·{' '}
                {club.cuposOcupados}/{club.capacidad} inscritos
              </p>
            </header>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Grupo</th>
                </tr>
              </thead>
              <tbody>
                {club.estudiantes.length ? (
                  club.estudiantes.map((estudiante) => (
                    <tr key={estudiante.enrollmentId}>
                      <td>{estudiante.nombre}</td>
                      <td>{estudiante.grupo}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>Sin estudiantes inscritos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}
