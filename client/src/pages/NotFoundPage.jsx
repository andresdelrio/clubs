import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>Página no encontrada</h1>
      <p>La ruta solicitada no existe. Regresa al inicio para continuar navegando.</p>
      <Link to="/" style={{ color: '#2563eb', fontWeight: 600 }}>
        Volver al inicio
      </Link>
    </div>
  );
}
