import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import './EnrollmentManager.css';

export default function EnrollmentManager() {
  const [sedes, setSedes] = useState([]);
  const [clubsBySede, setClubsBySede] = useState({});
  const [assignSede, setAssignSede] = useState('');
  const [assignClub, setAssignClub] = useState('');
  const [assignDocument, setAssignDocument] = useState('');
  const [assignStatus, setAssignStatus] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const [filterSede, setFilterSede] = useState('');
  const [filterClub, setFilterClub] = useState('');
  const [filterGrupo, setFilterGrupo] = useState('');
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorReport, setErrorReport] = useState(null);

  useEffect(() => {
    const loadSedes = async () => {
      try {
        const response = await api.get('/api/sedes');
        const sedeList = response.data.data || [];
        setSedes(sedeList);
        if (!assignSede && sedeList.length) {
          setAssignSede(sedeList[0].slug);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadSedes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!assignSede) return;
    const fetchAssignClubs = async () => {
      try {
        const response = await api.get(`/api/sedes/${assignSede}/clubs`);
        setClubsBySede((prev) => ({
          ...prev,
          [assignSede]: response.data.data?.clubs || [],
        }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssignClubs();
  }, [assignSede]);

  const clubsForAssign = useMemo(
    () => clubsBySede[assignSede] || [],
    [assignSede, clubsBySede]
  );

  const clubsForFilter = useMemo(
    () => clubsBySede[filterSede] || [],
    [filterSede, clubsBySede]
  );

  const ensureClubsLoaded = async (sedeSlug, force = false) => {
    if (!sedeSlug) return;
    if (!force && clubsBySede[sedeSlug]) return;
    const response = await api.get(`/api/sedes/${sedeSlug}/clubs`);
    setClubsBySede((prev) => ({
      ...prev,
      [sedeSlug]: response.data.data?.clubs || [],
    }));
  };

  const handleAssign = async (event) => {
    event.preventDefault();
    if (!assignDocument || !assignClub) {
      setAssignStatus({ type: 'error', message: 'Documento y club son obligatorios.' });
      return;
    }
    setAssignLoading(true);
    setAssignStatus(null);
    try {
      await api.post('/api/admin/inscripciones', {
        documento: assignDocument.trim().toUpperCase(),
        clubId: Number(assignClub),
      });
      setAssignStatus({ type: 'success', message: 'Inscripción asignada correctamente.' });
      setAssignDocument('');
      await loadReport();
      await ensureClubsLoaded(assignSede, true);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setAssignStatus({ type: 'error', message });
    } finally {
      setAssignLoading(false);
    }
  };

  const loadReport = async () => {
    setLoadingReport(true);
    setErrorReport(null);
    try {
      await ensureClubsLoaded(filterSede);
      const response = await api.get('/api/reportes/inscripciones', {
        params: {
          sede: filterSede || undefined,
          grupo: filterGrupo || undefined,
          clubId: filterClub || undefined,
        },
      });
      const reportData = response.data.data;
      setReport(reportData);
      if (reportData?.clubs) {
        const sedeSlugs = [...new Set(reportData.clubs.map((club) => club.sedeSlug))];
        await Promise.all(sedeSlugs.map((slug) => ensureClubsLoaded(slug)));
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setErrorReport(message);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMove = async (enrollmentId, sedeSlug, newClubId, resetSelect) => {
    if (!newClubId) return;
    try {
      await api.patch(`/api/admin/inscripciones/${enrollmentId}/mover`, {
        nuevoClubId: Number(newClubId),
      });
      await ensureClubsLoaded(sedeSlug, true);
      await loadReport();
    } catch (err) {
      window.alert(err.response?.data?.message || err.message);
    } finally {
      if (resetSelect) resetSelect();
    }
  };

  const handleDelete = async (enrollmentId) => {
    if (!window.confirm('¿Deseas desinscribir a este estudiante?')) return;
    try {
      await api.delete(`/api/admin/inscripciones/${enrollmentId}`);
      await loadReport();
    } catch (err) {
      window.alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="enrollment-manager">
      <section className="assign-card">
        <h2>Asignar estudiante a un club</h2>
        <form onSubmit={handleAssign} className="assign-form">
          <div className="assign-grid">
            <label htmlFor="assign-sede">
              Sede
              <select
                id="assign-sede"
                value={assignSede}
                onChange={(event) => {
                  setAssignSede(event.target.value);
                  setAssignClub('');
                }}
              >
                <option value="">Selecciona sede</option>
                {sedes.map((sede) => (
                  <option key={sede.slug} value={sede.slug}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="assign-club">
              Club
              <select
                id="assign-club"
                value={assignClub}
                onChange={(event) => setAssignClub(event.target.value)}
              >
                <option value="">Selecciona club</option>
                {clubsForAssign.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.nombre} ({club.cuposDisponibles} libres)
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="assign-documento">
              Documento estudiante
              <input
                id="assign-documento"
                type="text"
                value={assignDocument}
                onChange={(event) => setAssignDocument(event.target.value)}
                placeholder="Documento"
              />
            </label>
          </div>

          {assignStatus && (
            <p className={assignStatus.type === 'error' ? 'feedback feedback--error' : 'feedback'}>
              {assignStatus.message}
            </p>
          )}

          <button type="submit" className="primary-button" disabled={assignLoading}>
            {assignLoading ? 'Asignando...' : 'Asignar'}
          </button>
        </form>
      </section>

      <section className="report-card">
        <header className="report-header">
          <div>
            <h2>Inscripciones actuales</h2>
            <p>Filtra por sede, grupo o club para compartir con los responsables.</p>
          </div>
          <button type="button" className="secondary-button" onClick={loadReport}>
            Actualizar listado
          </button>
        </header>

        <div className="filters">
          <label htmlFor="filter-sede">
            Sede
            <select
              id="filter-sede"
              value={filterSede}
              onChange={async (event) => {
                const slug = event.target.value;
                setFilterSede(slug);
                setFilterClub('');
                await ensureClubsLoaded(slug);
              }}
            >
              <option value="">Todas</option>
              {sedes.map((sede) => (
                <option key={sede.slug} value={sede.slug}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="filter-grupo">
            Grupo
            <input
              id="filter-grupo"
              type="text"
              value={filterGrupo}
              onChange={(event) => setFilterGrupo(event.target.value)}
              placeholder="Ej: 10A"
            />
          </label>

          <label htmlFor="filter-club">
            Club
            <select
              id="filter-club"
              value={filterClub}
              onChange={(event) => setFilterClub(event.target.value)}
            >
              <option value="">Todos</option>
              {clubsForFilter.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loadingReport && <p>Cargando inscripciones...</p>}
        {errorReport && <p className="feedback feedback--error">{errorReport}</p>}

        <div className="report-table">
          {report?.clubs?.map((club) => (
            <div key={club.clubId} className="club-report">
              <header>
                <h3>{club.clubNombre}</h3>
                <p>
                  {club.sedeNombre} · Responsable: {club.clubResponsable} ·{' '}
                  {club.cuposOcupados}/{club.capacidad} inscritos
                </p>
              </header>
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Grupo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {club.estudiantes.length ? (
                    club.estudiantes.map((estudiante) => (
                      <tr key={estudiante.enrollmentId}>
                        <td>{estudiante.nombre}</td>
                        <td>{estudiante.documento}</td>
                        <td>{estudiante.grupo}</td>
                        <td>
                          <div className="row-actions">
                            <select
                              defaultValue=""
                              onChange={(event) => {
                                const value = event.target.value;
                                const reset = () => {
                                  event.target.value = '';
                                };
                                handleMove(
                                  estudiante.enrollmentId,
                                  club.sedeSlug,
                                  value,
                                  reset
                                );
                              }}
                            >
                              <option value="">Mover a...</option>
                              {(clubsBySede[club.sedeSlug] || [])
                                .filter((optionClub) => optionClub.id !== club.clubId)
                                .map((optionClub) => (
                                  <option key={optionClub.id} value={optionClub.id}>
                                    {optionClub.nombre}
                                  </option>
                                ))}
                            </select>
                            <button
                              type="button"
                              className="danger-button"
                              onClick={() => handleDelete(estudiante.enrollmentId)}
                            >
                              Desinscribir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>Sin estudiantes inscritos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
