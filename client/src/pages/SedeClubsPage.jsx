import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import ClubCard from '../components/ClubCard';
import EnrollmentModal from '../components/EnrollmentModal';
import api from '../lib/api';
import './SedeClubsPage.css';

export default function SedeClubsPage() {
  const { sedeSlug } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, setData } = useFetch(
    `/api/sedes/${sedeSlug}/clubs`,
    {},
    [sedeSlug]
  );
  const [selectedClub, setSelectedClub] = useState(null);

  useEffect(() => {
    setSelectedClub(null);
  }, [sedeSlug]);

  const refreshClubs = async () => {
    try {
      const response = await api.get(`/api/sedes/${sedeSlug}/clubs`);
      setData(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInscripcionExitosa = () => {
    refreshClubs();
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <button type="button" className="link-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <div>
          <h1>{data?.sede?.nombre || 'Clubs'}</h1>
          <p>
            Explora los clubs disponibles en esta sede y revisa los cupos en tiempo real.
          </p>
        </div>
      </header>

      {loading && <p>Cargando clubs...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="club-grid">
        {data?.clubs?.map((club) => (
          <ClubCard key={club.id} club={club} onInscribir={setSelectedClub} />
        ))}
      </div>

      {selectedClub && (
        <EnrollmentModal
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onSuccess={handleInscripcionExitosa}
        />
      )}
    </div>
  );
}
