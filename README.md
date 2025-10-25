# Sistema de gestión de clubs temáticos

Aplicación monolítica construida con Node.js (Express) y React para administrar los clubs temáticos y las inscripciones de estudiantes en una institución educativa con sedes Blanca Correa y San José.

## Características principales

- **Zona pública**
  - Selección inicial de sede y visualización de clubs disponibles con cupos en tiempo real.
  - Inscripción de estudiantes habilitados mediante documento de identidad, con advertencia previa y bloqueo automático cuando se llena el cupo.
  - Vista pública de reportes filtrables por sede, grupo y club para compartir con responsables sin autenticación.

- **Zona administrativa (`/gestionclubs`)**
  - Acceso protegido por código configurable (`ADMIN_ACCESS_CODE`).
  - Gestión de clubs: creación, edición (nombre, descripción, responsable, capacidad, URL de imagen) y eliminación con control de cupos.
  - Importación masiva de estudiantes habilitados mediante archivos CSV (Sede, Grupo, Nombre, Documento) con reporte de duplicados y errores.
  - Administración de inscripciones: asignación manual por documento, movimientos entre clubs de la misma sede y desinscripción.
  - Tableros y filtros con información de cupos ocupados/libres por club.

- **Base de datos MySQL**
  - Esquema incluido en `data/schema.sql` y datos base en `data/seeds.sql`.
  - Integración mediante `mysql2` con pool de conexiones configurables.

## Requerimientos previos

- Node.js 18+
- MySQL 8+ o compatible

## Configuración

1. Crea un archivo `.env` en la raíz basado en `.env.example` y completa las variables de conexión a MySQL, el código de acceso admin y, si la app vive en un subdirectorio (p. ej. `/clubs`), ajusta `APP_BASE_PATH`.
2. Crea la base de datos y ejecuta:

   ```sql
   SOURCE data/schema.sql;
   SOURCE data/seeds.sql;
   ```

3. Instala dependencias y genera el frontend:

   ```bash
   npm install
   npm run build   # Construye el frontend (Vite -> client/dist)
   ```

## Scripts disponibles

- `npm run dev`: levanta el backend con Nodemon (`http://localhost:3000`).
- `npm run start`: inicia el servidor en modo producción.
- `npm run client:dev`: ejecuta el frontend en modo desarrollo (Vite) con hot reload.
- `npm run build`: compila los assets del frontend en `client/dist` para ser servidos por Express.

Durante el desarrollo suele ejecutarse el backend (`npm run dev`) y el frontend (`npm run client:dev`) en paralelo. Configura la variable `VITE_API_BASE_URL` si deseas consumir un backend remoto durante el desarrollo del frontend.

## Estructura

```
.
├── src/
│   ├── app.js                # Configuración de Express y rutas
│   ├── controllers/          # Controladores HTTP (público, admin, reportes)
│   ├── middleware/           # Middlewares de error y autenticación
│   ├── models/               # Acceso a datos MySQL
│   ├── services/             # Lógica de negocio (clubs, estudiantes, inscripciones)
│   └── utils/                # Utilidades (errores, CSV, constantes)
├── client/                   # Aplicación React (Vite)
├── data/schema.sql           # Definición de tablas
├── data/seeds.sql            # Inserción de sedes base
├── server.js                 # Punto de entrada del backend
└── README.md
```

## Notas adicionales

- Los archivos CSV deben estar codificados en UTF-8 y contar con encabezados `Sede,Grupo,Nombre,Documento`.
- Las imágenes de los clubs se referencian mediante URLs públicas, no se almacenan en el servidor.
- El código de acceso admin es un valor fijo controlado vía entorno (`ADMIN_ACCESS_CODE`).
- La API expone endpoints REST bajo `/api`. Para requerimientos adicionales o integraciones futuras se puede extender con facilidad las capas de servicios y controladores.
