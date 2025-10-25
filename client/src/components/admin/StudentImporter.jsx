import { useState } from 'react';
import api from '../../lib/api';
import './StudentImporter.css';

export default function StudentImporter() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Selecciona un archivo CSV para continuar.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      const response = await api.post('/api/admin/estudiantes/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.data);
      setFile(null);
      (document.getElementById('csv-input') || {}).value = '';
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="importer">
      <form className="importer-form" onSubmit={handleSubmit}>
        <h2>Cargar estudiantes habilitados</h2>
        <p>
          Formato esperado (CSV con encabezados): <strong>Sede, Grupo, Nombre, Documento</strong>.
          Se ignorarán duplicados por documento y se reportarán en el resumen.
        </p>
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        {error && <p className="feedback feedback--error">{error}</p>}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Procesando...' : 'Importar archivo'}
        </button>
      </form>

      {result && (
        <div className="import-result">
          <h3>Resultado de la importación</h3>
          <div className="result-grid">
            <div>
              <h4>Nuevos registros</h4>
              <ul>
                {result.agregados.length ? (
                  result.agregados.map((item) => (
                    <li key={item.documento}>
                      {item.documento} - {item.nombre}
                    </li>
                  ))
                ) : (
                  <li>No se agregaron nuevos estudiantes.</li>
                )}
              </ul>
            </div>
            <div>
              <h4>Duplicados</h4>
              <ul>
                {result.duplicados.length ? (
                  result.duplicados.map((item, index) => (
                    <li key={`${item.documento}-${index}`}>
                      {item.documento} - {item.motivo}
                    </li>
                  ))
                ) : (
                  <li>No se detectaron duplicados.</li>
                )}
              </ul>
            </div>
            <div>
              <h4>Errores</h4>
              <ul>
                {result.errores.length ? (
                  result.errores.map((item, index) => <li key={index}>{item}</li>)
                ) : (
                  <li>Sin errores.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
