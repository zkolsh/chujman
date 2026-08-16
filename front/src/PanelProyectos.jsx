/**
 * @fileoverview Panel principal donde el usuario puede ver, crear y eliminar sus proyectos
 */

import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

/**
 * Componente que muestra la lista de proyectos del usuario y permite gestionarlos.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {(project: Object) => void} props.onSelectProject - Función que se ejecuta al seleccionar un proyecto para abrirlo
 * @param {() => void} props.onLogout - Función para cerrar la sesión actual
 * @returns {JSX.Element}
 */

function PanelProyectos({ onSelectProject, onLogout, onGoToProfile, onUpgrade }) {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [projectNameError, setProjectNameError] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProjects(data.data);
      } else {
        setErrorMsg('Error al cargar proyectos');
      }
    } catch (err) {
      setErrorMsg('Error de red al conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProjectNameError(true);
      return;
    }
    setProjectNameError(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, description })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setName('');
        setDescription('');
        fetchProjects();
      } else {
        if (data.message && data.message.includes('Límite')) {
          setConfirmConfig({
            isOpen: true,
            title: '¡Límite Alcanzado!',
            message: 'Parece que ya usaste todos los proyectos de tu plan actual. Si necesitas más capacidad, puedes suscribirte a un plan superior y seguir creando al instante.',
            confirmText: 'Ver Planes Disponibles',
            isDanger: false,
            onConfirm: () => {
              setConfirmConfig({ ...confirmConfig, isOpen: false });
              if (onUpgrade) onUpgrade();
            }
          });
        } else {
          setErrorMsg(data.message || 'Error al crear proyecto');
        }
      }
    } catch (err) {
      setErrorMsg('Error de red al crear proyecto');
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation(); // Evitar que abra el proyecto al hacer clic en borrar

    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Proyecto',
      message: '¿Seguro que quieres eliminar este proyecto y TODAS sus tareas? Esta acción no se puede deshacer.',
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig({ ...confirmConfig, isOpen: false });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (response.ok && data.success) {
            fetchProjects(); // Recargar la lista
          } else {
            alert(data.message || 'Error al eliminar');
          }
        } catch (err) {
          alert('Error de red al eliminar el proyecto');
        }
      }
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-950 font-sans pb-12">
      <nav className="h-14 bg-slate-900 text-white px-6 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="text-lg font-bold tracking-tight">
          Menú de Proyectos
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-sm font-medium text-slate-300">
            Hola, <span className="text-white">{localStorage.getItem('userName') || 'Usuario'}</span>
          </span>
          <button
            onClick={onGoToProfile}
            className="inline-flex items-center justify-center rounded-md text-xs font-semibold transition-colors border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white h-8 px-4"
          >
            Mi Perfil
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-md text-xs font-semibold transition-colors border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white h-8 px-4"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">

        {/* Formulario de Nuevo Proyecto */}
        <div className="md:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Nuevo Proyecto</h3>
              <p className="text-sm text-slate-500">Crea un espacio para tus diagramas</p>
            </div>
            <div className="p-6 pt-0">
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nombre del proyecto</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (e.target.value.trim()) setProjectNameError(false);
                    }}
                    placeholder="Ej: Base de Datos II"
                    className={`flex h-9 w-full rounded-md border ${projectNameError ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-slate-950'} bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1`}
                  />
                  {projectNameError && (
                    <p className="text-xs text-red-500 mt-1">El nombre es obligatorio.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Descripción (Opcional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Breve detalle..."
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                  />
                </div>
                
                {errorMsg && !errorMsg.includes('Límite') && (
                  <div className="p-3 rounded-md text-sm border bg-red-50 border-red-200 text-red-600">
                    <p className="font-medium">Ocurrió un error</p>
                    <p className="mt-1">{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-4 py-2 w-full shadow"
                >
                  Crear Proyecto
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Lista de Proyectos */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Tus Proyectos</h2>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando tus proyectos...</p>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-500">Aún no tienes proyectos creados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div className="p-6 pr-10">
                    <h3 className="font-semibold leading-none tracking-tight mb-2 group-hover:text-slate-700 transition-colors">{proj.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{proj.description || "Sin descripción."}</p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteProject(e, proj.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                    title="Eliminar proyecto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>

                  <div className="px-6 pb-6 pt-0 mt-auto flex justify-between items-center text-xs text-slate-500">
                    <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                    <span className="font-medium text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">Abrir &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDanger={confirmConfig.isDanger}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </div>
  );
}

export default PanelProyectos;