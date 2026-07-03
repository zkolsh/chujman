Bootstrapping del servidor
==========================

Crear el archivo `back/.env` con:
```
PORT=55500
JWT_SECRET=AlejandroGuillermoSchujman
FRONTEND_URL=http://localhost:5173
DATABASE_URL=file:./dev.db
```

Luego correr los siguientes comandos en esta carpeta:
```
npm install
npx prisma migrate dev --name init
npx prisma generate
```

Correr el servidor
==================

```
$ npm run dev
```

# Estructura de Archivos del Backend

Este documento explica la organización detallada de la API Node.js/Express ubicada en la carpeta `back/src`. El proyecto utiliza una arquitectura de capas bien definida (Rutas, Controladores, Servicios y Repositorios) para garantizar que el código sea limpio y escalable.

## Capa de Entrada (Core)
- **`server.js`**: Este es el punto de entrada de la aplicación. Su única responsabilidad es arrancar la base de datos (Prisma) y poner a escuchar al servidor HTTP en el puerto definido en `.env`.
- **`app.js`**: Se encarga exclusivamente de configurar la instancia de Express. Aquí se configuran los middlewares generales: `cors` (para permitir que el frontend se comunique con el backend), `helmet` (para seguridad de los headers), `express.json()` (para leer el body de las peticiones en formato JSON) y se inyectan las rutas principales (`/api/v1`).

## 1. Rutas (`routes/`)
Esta carpeta define las URLs (endpoints) que la API expone al mundo exterior y las asocia con el controlador correspondiente. No hay lógica de negocio aquí.
- **`index.js`**: El enrutador maestro. Se encarga de cargar todas las rutas de la versión 1 (v1) bajo el prefijo `/api/v1`. También incluye una ruta `/health` para comprobar que el servidor está vivo.
- **`v1/index.js`**: Agrupa y exporta las distintas rutas de la API (auth, proyectos, tareas).
- **`v1/auth.routes.js`**: Define las rutas para iniciar sesión (`/login`), registrarse (`/register`) y verificar si un token sigue siendo válido (`/validateToken`).
- **`v1/project.routes.js`**: Expone las rutas para obtener los proyectos de un usuario (`GET /`), crear un proyecto nuevo (`POST /`) y borrar un proyecto (`DELETE /:id`). Utiliza un middleware para asegurar que solo usuarios logueados accedan.
- **`v1/task.routes.js`**: Define rutas específicas para interactuar con las tareas de un proyecto (`/:projectId/tasks`) y sus relaciones/dependencias (`/:projectId/relations`), incluyendo la creación, actualización y borrado.

## 2. Controladores (`controllers/`)
Los controladores son el puente entre las rutas y los servicios. Su trabajo es extraer los datos de la petición (de `req.body`, `req.params` o `req.user`), llamar al servicio correspondiente, y enviar una respuesta JSON (`res.json`).
- **`auth.controller.js`**: Extrae el email y la contraseña enviados por el usuario y se los pasa al servicio de autenticación. Devuelve el token JWT si el proceso es exitoso.
- **`project.controller.js`**: Extrae el ID del usuario del token JWT para buscar o crear proyectos que solo le pertenezcan a él.
- **`task.controller.js`**: Maneja las solicitudes de los nodos (tareas) y aristas (relaciones). Por ejemplo, al actualizar el estado de una tarea, extrae el nuevo estado del body y el ID de la tarea desde la URL.

## 3. Servicios (`services/`)
Los servicios contienen toda la "Lógica de Negocio". Si hay reglas en la aplicación (como "una tarea no puede relacionarse consigo misma" o "no puedes crear un usuario con un email que ya existe"), se validan aquí.
- **`auth.service.js`**: Valida las contraseñas comparándolas con la BD, hashea las contraseñas nuevas usando `bcrypt` al registrar un usuario, y genera el token de sesión usando `jwt`.
- **`project.service.js`**: Contiene la lógica para crear y borrar proyectos. Si borra un proyecto, también se encarga de llamar a los repositorios para borrar en cascada todas las tareas y relaciones que estaban dentro de ese proyecto.
- **`task.service.js`**: Realiza validaciones de negocio sobre las tareas, como asegurarse de que el estado ingresado por el usuario sea estrictamente uno válido ("No Iniciado", "En Progreso", "Completado").

## 4. Repositorios (`repositories/`)
Esta capa es la **única** que habla directamente con la base de datos a través de Prisma. Sirve para que el resto de la aplicación (los servicios) no necesite saber qué base de datos estamos usando ni su sintaxis.
- **`usuario.repository.js`**: Hace las consultas a Prisma para encontrar un usuario por email o crear uno nuevo (`prisma.user.findUnique`, `prisma.user.create`).
- **`project.repository.js`**: Se encarga de buscar, guardar y borrar registros exclusivamente en la tabla `Project`.
- **`task.repository.js`**: Maneja las tablas `Archivo` (que representan las tareas/nodos del grafo) y `ArchivoRelacion` (que representan las dependencias/aristas entre tareas). Tiene métodos para crear, actualizar texto/estado, y vincular relaciones.

## Middlewares y Utilidades (`middlewares/` y `utils/`)
- **`middlewares/auth.js`**: Contiene `verifyToken`, una función que intercepta la petición entrante, lee el header de `Authorization`, verifica que el JWT sea válido y no haya expirado, e inyecta la información del usuario dentro de `req.user` para que los controladores puedan saber quién está logueado.
- **`middlewares/errorHandler.js`**: Captura cualquier error que ocurra en cualquier parte de la aplicación (que normalmente "crashearía" el servidor) y responde de manera estandarizada con un JSON seguro, ocultando información sensible al usuario final.
- **`utils/bcrypt.js`** y **`utils/jwt.js`**: Archivos con pequeñas funciones auxiliares y puras para encriptar claves y firmar tokens.
