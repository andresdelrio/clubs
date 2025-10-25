import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import './ClubManager.css';

const initialFormState = {
  sedeSlug: '',
  nombre: '',
  descripcion: '',
  responsable: '',
  capacidad: '',
  imagenUrl: '',
};

export default function ClubManager() {
  const [sedes, setSedes] = useState([]);
  const [selectedSede, setSelectedSede] = useState('');
  const [clubsBySede, setClubsBySede] = useState({});
  const [form, setForm] = useState(initialFormState);
  const [editingClubId, setEditingClubId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);

  const clubsForSelectedSede = useMemo(
    () => clubsBySede[selectedSede] || [],
    [clubsBySede, selectedSede]
  );

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await api.get('/api/sedes');
        const sedeList = response.data.data || [];
        setSedes(sedeList);
        if (!selectedSede && sedeList.length) {
          setSelectedSede(sedeList[0].slug);
        }
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'No se pudieron cargar las sedes.' });
      }
    };
    fetchSedes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSede) return;
    const load = async () => {
      setLoadingClubs(true);
      try {
        const response = await api.get(`/api/sedes/${selectedSede}/clubs`);
        setClubsBySede((prev) => ({
          ...prev,
          [selectedSede]: response.data.data?.clubs || [],
        }));
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'Error al cargar los clubs de la sede.' });
      } finally {
        setLoadingClubs(false);
      }
    };
    load();
  }, [selectedSede]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm((prev) => ({
      ...initialFormState,
      sedeSlug: selectedSede || prev.sedeSlug,
    }));
    setEditingClubId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        responsable: form.responsable.trim(),
        capacidad: Number(form.capacidad),
        imagenUrl: form.imagenUrl.trim(),
      };

      if (!payload.nombre || Number.isNaN(payload.capacidad)) {
        throw new Error('Completa todos los campos obligatorios.');
      }

      if (editingClubId) {
        await api.put(`/api/admin/clubs/${editingClubId}`, payload);
        setStatus({ type: 'success', message: 'Club actualizado correctamente.' });
      } else {
        const sedeSlug = form.sedeSlug || selectedSede;
        if (!sedeSlug) {
          throw new Error('Debes seleccionar una sede.');
        }
        await api.post('/api/admin/clubs', { ...payload, sedeSlug });
        setStatus({ type: 'success', message: 'Club creado correctamente.' });
      }
      resetForm();
      const response = await api.get(`/api/sedes/${selectedSede}/clubs`);
      setClubsBySede((prev) => ({
        ...prev,
        [selectedSede]: response.data.data?.clubs || [],
      }));
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (club) => {
    setEditingClubId(club.id);
    setForm({
      sedeSlug: club.sedeSlug,
      nombre: club.nombre,
      descripcion: club.descripcion || '',
      responsable: club.responsable || '',
      capacidad: String(club.capacidad),
      imagenUrl: club.imagenUrl || '',
    });
    setSelectedSede(club.sedeSlug);
  };

  const handleDelete = async (clubId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este club?')) return;
    try {
      await api.delete(`/api/admin/clubs/${clubId}`);
      const response = await api.get(`/api/sedes/${selectedSede}/clubs`);
      setClubsBySede((prev) => ({
        ...prev,
        [selectedSede]: response.data.data?.clubs || [],
      }));
      setStatus({ type: 'success', message: 'Club eliminado.' });
      if (editingClubId === clubId) {
        resetForm();
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setStatus({ type: 'error', message });
    }
  };

  return (
    <div className="club-manager">
      <form className="club-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label htmlFor="club-sede">
            Sede
            <select
              id="club-sede"
              value={form.sedeSlug || selectedSede}
              onChange={(event) => {
                updateForm('sedeSlug', event.target.value);
                setSelectedSede(event.target.value);
              }}
              disabled={!!editingClubId}
            >
              <option value="">Selecciona sede</option>
              {sedes.map((sede) => (
                <option key={sede.slug} value={sede.slug}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="club-nombre">
            Nombre del club
            <input
              id="club-nombre"
              type="text"
              value={form.nombre}
              onChange={(event) => updateForm('nombre', event.target.value)}
              required
            />
          </label>

          <label htmlFor="club-responsable">
            Responsable
            <input
              id="club-responsable"
              type="text"
              value={form.responsable}
              onChange={(event) => updateForm('responsable', event.target.value)}
              required
            />
          </label>

          <label htmlFor="club-capacidad">
            Capacidad (estudiantes)
            <input
              id="club-capacidad"
              type="number"
              min="0"
              value={form.capacidad}
              onChange={(event) => updateForm('capacidad', event.target.value)}
              required
            />
          </label>
        </div>

        <label htmlFor="club-descripcion">
          Descripción
          <textarea
            id="club-descripcion"
            rows="3"
            value={form.descripcion}
            onChange={(event) => updateForm('descripcion', event.target.value)}
          />
        </label>

        <label htmlFor="club-imagen">
          URL de la imagen (opcional)
          <input
            id="club-imagen"
            type="url"
            value={form.imagenUrl}
            onChange={(event) => updateForm('imagenUrl', event.target.value)}
            placeholder="https://..."
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={loading}>
            {loading
              ? 'Guardando...'
              : editingClubId
              ? 'Actualizar club'
              : 'Crear club'}
          </button>
          {editingClubId && (
            <button type="button" className="secondary-button" onClick={resetForm}>
              Cancelar edición
            </button>
          )}
        </div>
        {status && (
          <p className={status.type === 'error' ? 'feedback feedback--error' : 'feedback'}>
            {status.message}
          </p>
        )}
      </form>

      <section className="club-list">
        <header>
          <h2>Clubs registrados</h2>
          <span>
            {loadingClubs ? 'Cargando...' : `${clubsForSelectedSede.length} clubs en la sede`}
          </span>
        </header>
        <div className="club-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Responsable</th>
                <th>Cupos disponibles</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clubsForSelectedSede.map((club) => (
                <tr key={club.id}>
                  <td>
                    <strong>{club.nombre}</strong>
                    <p className="club-table__description">{club.descripcion}</p>
                  </td>
                  <td>{club.responsable}</td>
                  <td>{club.cuposDisponibles}</td>
                  <td>{club.capacidad}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => handleEdit(club)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDelete(club.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!clubsForSelectedSede.length && (
                <tr>
                  <td colSpan="5">No hay clubs registrados en esta sede.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
