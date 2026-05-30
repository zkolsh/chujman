import React, { useState, useEffect } from 'react';

function PanelProyectos({ onSelectProject, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

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
    if (!name.trim()) return;

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
        setErrorMsg(data.message || 'Error al crear proyecto');
      }
    } catch (err) {
      setErrorMsg('Error de red al crear proyecto');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      {}
      <nav className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex justify-between items-center sticky top-0 z-10">
        <div className="text-lg font-semibold text-slate-900 tracking-tight">
          Mesa de Proyectos
        </div>
        <button 
          onClick={onLogout}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-9 px-4 py-2"
        >
          Cerrar Sesión
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {}
        <div className="md:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <div className="text-lg font-semibold leading-none tracking-tight">Nuevo Proyecto</div>
              <p className="text-sm text-slate-500">Crea un tablero para tus dependencias.</p>
            </div>
            <div className="p-6 pt-0">
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center font-medium">{errorMsg}</div>
              )}
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nombre</label>
                  <input 
                    type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                    placeholder="Ej: Lanzamiento de App"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Descripción</label>
                  <textarea 
                    value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                    className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                    placeholder="Breve resumen de los objetivos..."
                  />
                </div>
                <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-4 py-2 w-full shadow">
                  Crear Tablero
                </button>
              </form>
            </div>
          </div>
        </div>

        {}
        <div className="md:col-span-2 space-y-4">
          <div className="text-lg font-semibold leading-none tracking-tight mb-4">Tus Tableros de Dependencias</div>
          
          {loading ? (
            <div className="text-sm text-slate-500">Cargando tableros...</div>
          ) : projects.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-white p-8 text-center animate-in fade-in-50">
              <p className="text-sm text-slate-500">No tienes proyectos creados aún. ¡Crea el primero a la izquierda!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div 
                  key={proj.id} 
                  onClick={() => onSelectProject(proj.id)}
                  className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="font-semibold leading-none tracking-tight mb-2 group-hover:text-slate-900">{proj.name}</div>
                    <p className="text-sm text-slate-500 line-clamp-2">{proj.description || "Sin descripción."}</p>
                  </div>
                  <div className="px-5 pb-5 pt-0 mt-auto flex justify-between items-center text-xs text-slate-500">
                    <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                    <span className="font-medium text-slate-900 hover:underline">Ver Grafo &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PanelProyectos;