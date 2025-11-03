import { useState, useEffect } from 'react';
import api from '../../lib/api';
import './InscripcionesToggle.css';

export default function InscripcionesToggle() {
  const [habilitadas, setHabilitadas] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEstado();
  }, []);

  const cargarEstado = async () => {
    try {
      const response = await api.get('/api/configuracion/inscripciones-habilitadas');
      setHabilitadas(response.data.data.habilitadas);
    } catch (err) {
      setError('Error al cargar el estado de inscripciones');
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      const nuevoEstado = !habilitadas;
      await api.patch('/api/configuracion/inscripciones', {
        habilitadas: nuevoEstado,
      });
      setHabilitadas(nuevoEstado);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el estado');
      // Revertir el estado en caso de error
      await cargarEstado();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscripciones-toggle">
      <div className="toggle-info">
        <h3>Control de inscripciones</h3>
        <p>
          {habilitadas
            ? 'Las inscripciones están abiertas. Los estudiantes pueden inscribirse en los clubs.'
            : 'Las inscripciones están cerradas. Los estudiantes no pueden inscribirse.'}
        </p>
      </div>
      <div className="toggle-control">
        <label className="switch">
          <input
            type="checkbox"
            checked={habilitadas}
            onChange={handleToggle}
            disabled={loading}
          />
          <span className="slider"></span>
        </label>
        <span className={`status-label ${habilitadas ? 'status-active' : 'status-inactive'}`}>
          {habilitadas ? 'Habilitadas' : 'Deshabilitadas'}
        </span>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
