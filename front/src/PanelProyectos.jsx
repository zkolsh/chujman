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
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600 tracking-tight">Mesa de Proyectos</h1>
        <button 
          onClick={onLogout}
          className="text-sm font-medium text-red-600 hover:text-red-700 transition"
        >
          Cerrar Sesión
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Nuevo Proyecto</h2>
          {errorMsg && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 text-xs rounded text-center">{errorMsg}</div>
          )}
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Lanzamiento de App"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Breve resumen de los objetivos..."
              />
            </div>
            <button type="submit" className="w-full py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-xs">
              Crear Tablero
            </button>
          </form>
        </div>

        {}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Tus Tableros de Dependencias</h2>
          
          {loading ? (
            <p className="text-sm text-gray-500">Cargando tableros...</p>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-500">No tienes proyectos creados aún. ¡Crea el primero a la izquierda!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div 
                  key={proj.id} 
                  onClick={() => onSelectProject(proj.id)}
                  className="bg-white p-5 rounded-lg shadow-xs border border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-600">{proj.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{proj.description || "Sin descripción."}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                    <span>Creado: {new Date(proj.createdAt).toLocaleDateString()}</span>
                    <span className="text-blue-500 font-medium">Ver Grafo &rarr;</span>
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