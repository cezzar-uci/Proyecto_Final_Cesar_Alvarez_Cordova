# Guía de presentación | TaskForge

**Autor:** César Álvarez Córdoba  
**Asignatura:** Optativo de Node.js

## 1. ¿Qué problema resuelve?

TaskForge organiza tareas por nombre, descripción, categoría, prioridad, estado y fecha límite. Permite a cada usuario consultar sus pendientes y completar un CRUD de manera sencilla. Además, el administrador puede revisar las tareas de todos los usuarios.

## 2. Arquitectura MVC

- **Modelo (`models/`):** SQL parametrizado para usuarios y tareas en PostgreSQL.
- **Vista (`views/`):** EJS, layout principal, componentes comunes y páginas HTML.
- **Controlador (`controllers/`):** atiende solicitudes y elige vista o redirección.
- **Servicios (`services/`):** validación y reglas de negocio.
- **Rutas (`routes/`):** endpoints, protegidos cuando corresponde.
- **Middleware (`middlewares/`):** identidad, autorización, CSRF y errores.

## 3. Seguridad implementada

1. Las contraseñas se guardan como hash bcrypt, con factor de costo 12.
2. El token JWT se emite al iniciar sesión y se envía en cookie HttpOnly.
3. Las consultas SQL usan parámetros en vez de insertar texto sin procesar.
4. Los usuarios no pueden gestionar tareas de otros, salvo la vista y eliminación del administrador.
5. Formularios protegidos contra CSRF y peticiones de inicio de sesión limitadas.

## 4. Demostración sugerida (5 minutos)

1. Abre la portada, entra en **Crear cuenta** y regístrate.
2. Abre **Nueva tarea**, introduce título, descripción, prioridad, estado y fecha.
3. Muestra el listado y el detalle de la tarea creada.
4. Modifica su estado y demuestra que cambian las métricas del panel.
5. Filtra por estado o prioridad; muestra la búsqueda.
6. Elimina una tarea y comprueba que desaparece.
7. Usa otra cuenta de usuario y comprueba que no ve las tareas anteriores.
8. Accede con una cuenta administradora y demuestra que sí puede consultar y eliminar tareas de todos.
9. Explica la estructura de carpetas y la base de datos PostgreSQL.
10. Enseña el repositorio y, si ya lo desplegaste, la URL pública con HTTPS.

## 5. Tablas de datos

- **users**: id, name, email, password_hash, role, created_at.
- **tasks**: id, user_id (clave foránea), title, description, category, priority, status, due_date, created_at, updated_at.

Relación: cada usuario puede tener muchas tareas, pero cada tarea pertenece a un usuario. Si se elimina un usuario de la base, sus tareas se eliminan por la restricción `ON DELETE CASCADE`.

## 6. Preguntas que puede hacer el profesor

**¿Por qué MVC?** Porque separa presentación, lógica de peticiones y acceso a datos, facilitando mantenimiento y pruebas.

**¿Por qué JWT?** Porque permite verificar una sesión con un token firmado y expiración; la cookie está protegida contra lectura desde JavaScript del navegador.

**¿Qué evita que un usuario edite tareas ajenas?** La consulta `UPDATE` filtra simultáneamente por ID de la tarea e ID del usuario autenticado.

**¿Qué ocurre si se introduce una fecha imposible?** El validador del servicio rechaza la entrada con un mensaje y no la inserta en PostgreSQL.

**¿Qué diferencia al admin?** Ve el listado completo y puede borrar tareas ajenas. No puede editarlas, por decisión explícita de permisos.

**¿Por qué PostgreSQL?** Porque es una base de datos relacional robusta, permite integridad referencial, índices y consultas parametrizadas.

## 7. Antes de entregar

- [ ] Instalar dependencias con `npm install` y ejecutar `npm test`.
- [ ] Configurar PostgreSQL y probar el proyecto completo con `npm start`.
- [ ] Crear y probar una cuenta admin real.
- [ ] Subir a GitHub **sin subir `.env`** y dar acceso al profesor.
- [ ] Desplegar en Render, comprobar HTTPS y copiar la URL real en el README o la plataforma de entrega.

**Nota:** Las imágenes `vista_previa_escritorio.png` y `vista_previa_movil.png` muestran una vista de diseño con información de demostración; no constituyen prueba de un despliegue real.
