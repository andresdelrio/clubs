import { useState } from 'react';
import api from '../lib/api';
import './EnrollmentModal.css';

export default function EnrollmentModal({ club, onClose, onSuccess }) {
  const [documento, setDocumento] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!confirmado) {
      setError('Debes aceptar la advertencia antes de inscribirte.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await api.post('/api/inscripciones', {
        documento,
        clubId: club.id,
        aceptaAdvertencia: true,
      });
      setMessage('Inscripción realizada con éxito.');
      setDocumento('');
      setConfirmado(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      const errMessage = err.response?.data?.message || err.message;
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <header className="modal-header">
          <h3>Inscripción a {club.nombre}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="modal-body">
          <p>
            {club.descripcion ||
              'Completa el formulario para registrarte en este club temático.'}
          </p>
          <div className="warning-box">
            <strong>Importante:</strong> La inscripción no se puede cancelar desde el
            portal estudiantil. Si necesitas cambios, comunícate con el responsable del
            club o con coordinación.
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label htmlFor="documento">
              Documento de identidad
              <input
                id="documento"
                type="text"
                value={documento}
                onChange={(event) => setDocumento(event.target.value.toUpperCase())}
                placeholder="Ingresa tu documento"
                required
              />
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={confirmado}
                onChange={(event) => setConfirmado(event.target.checked)}
              />
              Confirmo que acepto la advertencia y deseo inscribirme.
            </label>

            {error && <p className="feedback feedback--error">{error}</p>}
            {message ? (
              <div className="success-actions">
                <p className="feedback feedback--success">{message}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={onClose}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    onClose();
                    window.location.href = '/';
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            ) : (
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar inscripción'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
