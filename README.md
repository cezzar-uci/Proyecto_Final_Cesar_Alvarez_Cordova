# TaskForge ✦ | Proyecto Final de Node.js

**Autor:** César Álvarez Córdoba  
**Asignatura:** Optativo de Node.js  
**Tipo:** Aplicación web full-stack con arquitectura MVC

TaskForge es una aplicación web para **organizar tareas personales**. Cada persona puede crear, consultar, editar y borrar sus propias tareas. Un administrador puede **consultar y eliminar tareas de todos los usuarios**. Utiliza autenticación mediante JWT, base de datos PostgreSQL y páginas dinámicas con EJS.

## Funcionalidades

- Registro y login con hash de contraseña `bcrypt` (12 rondas).
- JWT firmado, almacenado en cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- Control de acceso de usuarios y administradores; las tareas se filtran por propietario directamente en SQL.
- CRUD completo de tareas: creación, lista, detalle, edición y eliminación.
- Categorías, prioridades, estados, fecha límite, búsqueda y filtros.
- Paginación de 8 tareas por página.
- Panel de estadísticas y diseño responsive para móvil, tableta y computadora.
- Validación de datos, consultas parametrizadas, protección CSRF en formularios, `helmet`, rate limit en autenticación y manejo de errores.
- Creación automática de tablas en PostgreSQL; soporte Docker/Compose y configuración para Render.
- Tests automatizados para validaciones básicas (Node.js Test Runner).

## Tecnologías

Node.js 22+, Express 4, PostgreSQL 16, `pg`, EJS, `express-ejs-layouts`, JWT (`jsonwebtoken`), `bcrypt`, `express-validator`, `helmet`, `express-rate-limit`, CSS y JavaScript nativos.

## Estructura MVC

```text
app.js                  Entrada de la aplicación web
config/database.js      Conexión PostgreSQL + inicialización
controllers/            Recibe las peticiones y devuelve vistas/redirects
services/               Reglas de negocio y normalización
models/                 Consultas SQL parametrizadas
routes/                 Definición de rutas
middlewares/            Sesión, CSRF, errores y protección de acceso
views/layouts/          Layout principal EJS
views/partials/         Componentes visuales comunes
views/auth/             Registro e inicio de sesión
views/tasks/            Listado, detalle, creación y edición
public/css/             Diseño responsive
public/js/              Interacciones del navegador
db/schema.sql           Definición de tablas e índices
scripts/                Inicialización, usuario admin, verificación
utils/                  Validación de tareas
tests/                  Pruebas unitarias
```

## Requisitos previos

- Node.js 22 o superior y npm.
- PostgreSQL 16, o una base de datos PostgreSQL alojada en un servicio externo.
- Internet para instalar las dependencias por primera vez.

## Instalación local (PostgreSQL instalado)

1. Descomprimir el ZIP y entrar en la carpeta del proyecto.
2. Crear la base de datos `taskforge` y un usuario con permisos. Si ya tienes una instancia de PostgreSQL, puedes usarla.
3. Copiar `.env.example` a `.env`.
4. Configurar el `DATABASE_URL` con los datos reales de PostgreSQL.
5. **Cambiar `JWT_SECRET`** por una clave larga aleatoria. Ejemplo para generar una en tu terminal:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

6. Instalar e iniciar:

   ```bash
   npm install
   npm start
   ```

7. Abrir **http://localhost:3000**. La aplicación crea las tablas si todavía no existen.

Para desarrollo con reinicio automático, usar `npm run dev`.

## Instalación con Docker Compose (opcional)

1. Copiar `.env.example` a `.env` y reemplazar `JWT_SECRET` por una clave robusta.
2. Tener Docker y Docker Compose instalados.
3. Ejecutar `docker compose up --build`.
4. Abrir http://localhost:3000.

> Nota: Docker Compose proporciona una base PostgreSQL local. Su usuario y contraseña de ejemplo son solo para desarrollo; nunca deben usarse en un entorno público. Si ya hay un PostgreSQL ocupando el puerto 5432, modificar o retirar la publicación del puerto de `db`.

## Cuenta administrador

Para crear una cuenta con rol `admin`, define temporalmente en `.env`:

```dotenv
ADMIN_EMAIL=admin@ejemplo.com
ADMIN_PASSWORD=una-contraseña-fuerte-de-12-o-mas-caracteres
```

Al ejecutar `npm start`, si esa cuenta no existe se crea con rol admin; si ya existe como usuario se promueve a admin. Para evitar mantener un secreto de administrador innecesario, **quita `ADMIN_PASSWORD` del entorno después de crear la cuenta**. La contraseña de cuentas existentes no se sobrescribe. Si conviertes una cuenta existente a admin, conserva su contraseña actual. El registro público siempre produce cuentas de rol `user`.

## Endpoints principales

| Método | Ruta | Función | Acceso |
|---|---|---|---|
| GET | `/` | Portada pública | Público |
| GET/POST | `/auth/registro` | Registro | Invitado |
| GET/POST | `/auth/iniciar-sesion` | Login | Invitado |
| POST | `/auth/salir` | Cerrar sesión | Autenticado |
| GET | `/tareas` | Listado, métricas y filtros | Autenticado |
| GET | `/tareas/nueva` | Formulario creación | Autenticado |
| POST | `/tareas` | Crear tarea | Autenticado |
| GET | `/tareas/:id` | Detalle | Propietario o admin |
| GET | `/tareas/:id/editar` | Formulario edición | Propietario |
| POST | `/tareas/:id/editar` | Editar | Propietario |
| POST | `/tareas/:id/eliminar` | Eliminar | Propietario o admin |
| GET | `/health` | Comprobación de salud | Público |

Filtros: `/tareas?search=estudio&status=pendiente&priority=alta&page=2`.

### Seguridad y permisos

El servidor no acepta el rol desde el formulario de registro. Los JWT se verifican y cada solicitud recupera el usuario real desde PostgreSQL. Las consultas restringen las tareas por `user_id` para usuarios comunes, mientras que el administrador puede consultar y borrar todas. Nadie puede editar una tarea ajena, ni siquiera el administrador. Las contraseñas se guardan como hashes `bcrypt`; jamás en texto plano. Todos los formularios POST llevan token CSRF. Las variables sensibles no deben subirse a Git.

## Pruebas

```bash
npm test       # pruebas unitarias de validación
npm run check # comprueba sintaxis de los archivos JS
```

### Comprobación manual recomendada

1. Crear dos cuentas normales A y B.
2. Crear una tarea con A, verificar detalle, edición y borrado.
3. Entrar con B y comprobar que no puede abrir, modificar ni borrar las tareas de A mediante URL.
4. Iniciar sesión como administrador; verificar que aparecen ambas y se pueden eliminar.
5. Probar filtros, paginación y formularios vacíos o con fechas inválidas.
6. Probar la interfaz desde móvil y escritorio.

## Despliegue en Render.com

El repositorio incluye `render.yaml` para crear el servicio web. **Para que la aplicación funcione en Internet tienes que aportar una base PostgreSQL accesible, por ejemplo Render Postgres u otra base PostgreSQL compatible.**

1. Subir este proyecto a un repositorio GitHub.
2. Crear una base PostgreSQL en Render (o proveedor que prefieras) y copiar su URL de conexión. Revisa los planes, límites y posibles costos vigentes del proveedor.
3. En Render, crear un **Web Service** usando el repositorio o utilizar el Blueprint de `render.yaml`.
4. Configurar variables de entorno:

   | Variable | Valor |
   |---|---|
   | `NODE_ENV` | `production` |
   | `NODE_VERSION` | `22` |
   | `DATABASE_URL` | URL real PostgreSQL |
   | `JWT_SECRET` | Clave aleatoria de al menos 32 caracteres |
   | `DATABASE_SSL` | `true` si la base requiere SSL, `false` si no |
   | `ADMIN_EMAIL` | Opcional; email de la cuenta administradora |
   | `ADMIN_PASSWORD` | Opcional; solo durante la creación inicial (>=12 caracteres) |

5. Comando de instalación `npm install --omit=dev`; comando de inicio `npm start`.
6. El inicio automático aplica `db/schema.sql` si las tablas no existen.
7. Visitar la URL pública HTTPS asignada por Render, hacer una cuenta y probar el CRUD completo.
8. Guardar el enlace público para la entrega académica; **no hay una URL pública real hasta realizar este proceso**.

**Nota SSL:** `DATABASE_SSL=true` activa verificación del certificado del servidor. Si el proveedor ya pasa opciones SSL por la URL, consulta su formato de conexión. No deshabilites la verificación del certificado en producción.

## Vistas previas del diseño (datos de demostración)

Puedes ver el aspecto del panel en `docs/vista_previa_escritorio.png` y `docs/vista_previa_movil.png`. También está disponible `docs/vista_previa.html` para visualizar el diseño estático sin iniciar el servidor. Son **datos de muestra**, no capturas de un servidor en producción. Para explicar el proyecto en clase, consulta `docs/GUIA_DE_PRESENTACION.md`.

## Entrega al profesor

- [x] Código fuente con arquitectura MVC.
- [x] CRUD y base PostgreSQL real (pendiente de conectarla en el entorno que lo ejecute).
- [x] JWT, bcrypt y dos roles.
- [x] Vistas EJS con layout y componentes reutilizables.
- [x] README, Docker, pruebas, búsqueda, filtros y paginación.
- [ ] **Pendiente externo:** subir a GitHub e invitar al profesor.
- [ ] **Pendiente externo:** desplegar en Render y entregar la URL pública HTTPS funcional.

## Autoría

**César Álvarez Córdoba**. Proyecto Final del Optativo de Node.js.
