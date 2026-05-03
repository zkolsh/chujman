Bootstrapping del servidor
==========================

Crear el archivo `back/.env` con:
```
SERVER_PORT=55500
JWT_SECRET=AlejandroGuillermoSchujman
FRONTEND_URL=http://localhost:5173/
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
