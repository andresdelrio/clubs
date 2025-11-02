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

## Deployment en cPanel con Node.js

Para desplegar la aplicación en un servidor compartido con cPanel bajo un subdirectorio (ej: `https://tudominio.com/clubs`):

### 1. Preparar el build localmente

1. **Configurar variables de entorno para producción:**

   Edita el archivo `.env` en la raíz con los datos de tu servidor:
   ```bash
   PORT=3000  # cPanel asignará el puerto automáticamente
   ADMIN_ACCESS_CODE=tu-codigo-seguro

   # Base path configuration (debe coincidir con la ruta de tu app en cPanel)
   APP_BASE_PATH=/clubs
   VITE_BASE_PATH=/clubs

   # Database credentials (desde cPanel -> MySQL Databases)
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=cpanel_user_dbuser
   DB_PASSWORD=tu_password_mysql
   DB_NAME=cpanel_user_clubs_db
   DB_CONNECTION_LIMIT=10
   ```

2. **Configurar el cliente para producción:**

   Edita `client/.env.production`:
   ```bash
   # IMPORTANTE: NO incluyas /api al final, se agrega automáticamente en el código
   VITE_API_BASE_URL=https://tudominio.com/clubs
   ```

3. **Build del frontend:**
   ```bash
   npm run build
   ```

### 2. Configurar en cPanel

1. **Setup Node.js Application:**
   - Ve a cPanel → Software → Setup Node.js App
   - Click "Create Application"
   - Configuración:
     - Node.js version: 18.x o superior
     - Application mode: Production
     - Application root: Ruta donde subirás el código (ej: `/home/usuario/clubs`)
     - Application URL: `clubs` (esto creará la ruta `/clubs`)
     - Application startup file: `server.js`

2. **Subir archivos:**
   - Sube TODOS los archivos del proyecto excepto:
     - `node_modules/`
     - `client/node_modules/`
     - `.env.local`
   - Asegúrate de incluir:
     - Todo el código fuente (`src/`, `client/`, `data/`)
     - `package.json` y `package-lock.json`
     - `server.js`
     - `client/dist/` (generado con `npm run build`)
     - `.env` (con las credenciales de producción)

3. **Instalar dependencias:**
   - En cPanel → Setup Node.js App → Tu aplicación
   - Click en "Run NPM Install"
   - Espera a que termine la instalación

4. **Configurar variables de entorno en cPanel:**
   - En la configuración de la aplicación Node.js
   - Agrega las variables de entorno (alternativamente al archivo .env):
     ```
     DB_HOST=localhost
     DB_USER=cpanel_user_dbuser
     DB_PASSWORD=tu_password
     DB_NAME=cpanel_user_clubs_db
     APP_BASE_PATH=/clubs
     ADMIN_ACCESS_CODE=tu-codigo
     ```

5. **Iniciar la aplicación:**
   - Click en "Start App" o "Restart"

### 3. Configurar la base de datos

1. En cPanel → MySQL Databases:
   - Crea la base de datos (ej: `cpanel_user_clubs_db`)
   - Crea un usuario y asígnalo a la base de datos
   - Anota las credenciales

2. En cPanel → phpMyAdmin:
   - Selecciona tu base de datos
   - Ejecuta el contenido de `data/schema.sql`
   - Ejecuta el contenido de `data/seeds.sql`

### 4. Verificar

- Accede a `https://tudominio.com/clubs`
- La aplicación debería estar funcionando

### Notas importantes para cPanel:

- **Puerto:** cPanel asigna automáticamente el puerto, no uses la variable PORT del .env
- **Application URL:** Debe coincidir con `APP_BASE_PATH` (sin la barra inicial)
- **Restart:** Después de cualquier cambio en el código, debes reiniciar la aplicación desde cPanel
- **Logs:** Revisa los logs en cPanel → Setup Node.js App → Ver logs si hay errores
- **.htaccess:** cPanel genera automáticamente el proxy reverso, no necesitas configurar nginx/apache manualmente

## Notas adicionales

- Los archivos CSV deben estar codificados en UTF-8 y contar con encabezados `Sede,Grupo,Nombre,Documento`.
- Las imágenes de los clubs se referencian mediante URLs públicas, no se almacenan en el servidor.
- El código de acceso admin es un valor fijo controlado vía entorno (`ADMIN_ACCESS_CODE`).
- La API expone endpoints REST bajo `/api`. Para requerimientos adicionales o integraciones futuras se puede extender con facilidad las capas de servicios y controladores.
