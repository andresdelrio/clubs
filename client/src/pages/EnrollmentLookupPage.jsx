import { useState } from 'react';
import api from '../lib/api';
import './EnrollmentLookupPage.css';

export default function EnrollmentLookupPage() {
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!documento.trim()) {
      setError('Ingresa tu documento para continuar.');
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await api.post('/api/inscripciones/consulta', {
        documento: documento.trim().toUpperCase(),
      });
      setResult(response.data.data);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lookup-page">
      <header>
        <h1>Consulta tu inscripción</h1>
        <p>
          Ingresa tu documento de identidad para conocer si estás inscrito en algún club
          y ver los detalles correspondientes.
        </p>
      </header>

      <form className="lookup-form" onSubmit={handleSubmit}>
        <label htmlFor="lookup-documento">
          Documento de identidad
          <input
            id="lookup-documento"
            type="text"
            value={documento}
            onChange={(event) => setDocumento(event.target.value)}
            placeholder="Ej: 1012345678"
          />
        </label>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
        {error && <p className="feedback feedback--error">{error}</p>}
      </form>

      {result && (
        <section className="lookup-result">
          {result.inscrito ? (
            <>
              <h2>¡Inscripción encontrada!</h2>
              <ul>
                <li>
                  <strong>Estudiante:</strong> {result.estudiante.nombre} (
                  {result.estudiante.grupo})
                </li>
                <li>
                  <strong>Documento:</strong> {result.estudiante.documento}
                </li>
                <li>
                  <strong>Sede:</strong> {result.sede.nombre}
                </li>
                <li>
                  <strong>Club:</strong> {result.club.nombre}
                </li>
                {result.club.responsable && (
                  <li>
                    <strong>Responsable:</strong> {result.club.responsable}
                  </li>
                )}
                {result.club.descripcion && (
                  <li>
                    <strong>Descripción:</strong> {result.club.descripcion}
                  </li>
                )}
              </ul>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Volver al inicio
              </button>
            </>
          ) : (
            <div className="lookup-empty">
              <h2>No se encontró una inscripción activa</h2>
              <p>
                Asegúrate de haber completado el registro o comunícate con el responsable
                para validar tu estado.
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Volver al inicio
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
