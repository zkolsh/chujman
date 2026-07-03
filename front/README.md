## bootstrapping

en esta carpeta crear un archivo `.env` con el siguiente contenido:
```
VITE_API_URL=http://localhost:55500/api/v1
```

## ejecución

ejecutar los siguientes comandos en la carpeta front:

```
npm install vite
# Estructura del Frontend

Este documento explica la organización básica de la carpeta `front/src` de la aplicación React.

## Archivos Principales
- **`main.jsx`**: Arranca la aplicación y configura React.
- **`App.jsx`**: Es el componente principal. Maneja las rutas (Login, Register, Dashboard) y sabe si el usuario inició sesión.

## Pantallas (Vistas)
- **`Inicio.jsx`**: Pantalla de bienvenida.
- **`Login.jsx`**: Formulario para iniciar sesión.
- **`Register.jsx`**: Formulario para crear una cuenta.
- **`PanelProyectos.jsx`**: Muestra la lista de proyectos del usuario. Permite crear o borrarlos.
- **`Receta.jsx`**: Pantalla extra (Easter Egg) con una receta.

## Componentes del Grafo de Tareas
Estos archivos hacen funcionar el mapa visual de tareas:
- **`TableroProyecto.jsx`**: Vista principal al abrir un proyecto. Carga las tareas y se comunica con el servidor.
- **`GraphWorkspace.jsx`**: Envuelve y dibuja el lienzo interactivo donde se ven las tareas.
- **`TaskNode.jsx`**: Es el diseño visual de cada "cajita" (tarea) en el mapa. Permite cambiar el estado de la tarea rápidamente con un menú.

## Componentes Reutilizables
- **`ConfirmModal.jsx`**: Una ventanita flotante para pedir confirmación antes de borrar algo.
