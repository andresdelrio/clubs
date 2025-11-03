import './ClubCard.css';

export default function ClubCard({ club, onInscribir, inscripcionesHabilitadas = true }) {
  return (
    <div className="club-card">
      {club.imagenUrl && (
        <div className="club-card__image">
          <img src={club.imagenUrl} alt={`Imagen del club ${club.nombre}`} />
        </div>
      )}
      <div className="club-card__body">
        <div className="club-card__header">
          <h3>{club.nombre}</h3>
          <span
            className={`club-card__badge ${
              club.cuposDisponibles > 0 ? 'club-card__badge--ok' : 'club-card__badge--full'
            }`}
          >
            {club.cuposDisponibles > 0
              ? `${club.cuposDisponibles} cupos disponibles`
              : 'Sin cupos disponibles'}
          </span>
        </div>
        <p className="club-card__description">{club.descripcion}</p>
        <div className="club-card__meta">
          <p>
            <strong>Responsable:</strong> {club.responsable || 'Por definir'}
          </p>
          <p>
            <strong>Cupos totales:</strong> {club.capacidad}
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => onInscribir(club)}
          disabled={club.cuposDisponibles <= 0 || !inscripcionesHabilitadas}
          title={
            !inscripcionesHabilitadas
              ? 'Las inscripciones están cerradas temporalmente'
              : club.cuposDisponibles <= 0
              ? 'Sin cupos disponibles'
              : 'Inscribirme en este club'
          }
        >
          {!inscripcionesHabilitadas
            ? 'Inscripciones cerradas'
            : 'Inscribirme'}
        </button>
      </div>
    </div>
  );
}
