import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: sedes, loading, error } = useFetch('/api/sedes', {}, []);

  const handleSelect = (slug) => {
    navigate(`/sede/${slug}`);
  };

  return (
    <div className="page-container">
      <header className="hero">
        <h1>Selecciona tu sede</h1>
        <p>Escoge la sede para ver los clubs disponibles y realizar tu inscripción.</p>
        <div className="hero-actions">
          <Link className="primary-button" to="/consulta-inscripcion">
            Consultar mi inscripción
          </Link>
        </div>
      </header>

      {loading && <p>Cargando sedes...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="card-grid">
        {sedes?.map((sede) => (
          <button
            key={sede.id}
            type="button"
            className="card-button"
            onClick={() => handleSelect(sede.slug)}
          >
            <h2>{sede.nombre}</h2>
            <p>Explorar clubs y cupos disponibles</p>
          </button>
        ))}
      </div>
    </div>
  );
}
