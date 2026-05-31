import React, { useState, useEffect } from 'react';

function TableroProyecto({ project, onSelectProject, onBackToDashboard, onLogout, onEasterEgg }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [project.id]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProjectsList(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const { nodes, edges } = data.data;
        const subtaskIds = edges.map(e => e.toId);
        const rootNodes = nodes.filter(n => !subtaskIds.includes(n.id));

        const formattedTasks = rootNodes.map(root => {
          const childEdges = edges.filter(e => e.fromId === root.id);
          const childIds = childEdges.map(e => e.toId);
          const subtareas = nodes.filter(n => childIds.includes(n.id));

          return {
            id: root.id,
            texto: root.texto,
            subtareas: subtareas
          };
        });

        setTasks(formattedTasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ texto: newTaskText })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNewTaskText('');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubtask = async (taskId, text) => {
    if (!text.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ texto: text })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta tarea?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar Oscuro y Moderno */}
      <aside className={`bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden opacity-0'}`}>
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50 min-w-[16rem]">
          <div className="font-bold text-white tracking-tight truncate">
            Hola, {localStorage.getItem('userName') || 'Usuario'}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white transition-colors p-1 flex items-center justify-center rounded-md hover:bg-slate-800"
            title="Ocultar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto min-w-[16rem]">
          <button 
            onClick={onBackToDashboard}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mb-6"
          >
            <span>&larr;</span> Volver al menú
          </button>

          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tus Proyectos</h3>
          <ul className="space-y-1">
            {projectsList.map(p => (
              <li key={p.id}>
                <button
                  onClick={() => onSelectProject(p)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${p.id === project.id ? 'bg-slate-800 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                  <div className="truncate">{p.name}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30 min-w-[16rem]">
          <button 
            onClick={onLogout}
            className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors border border-slate-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        {/* Botón Flotante para Abrir Menú (Solo visible si está cerrado) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 p-2 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex items-center justify-center w-10 h-10 z-30"
            title="Mostrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}

        <div className="p-8 max-w-6xl mx-auto w-full pt-12">
          
          {/* Header del Tablero integrado */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-base text-slate-500 mt-2">{project.description}</p>
            )}
          </div>

          {/* Formulario de nueva tarea */}
          <div className="mb-10 flex items-center space-x-2">
            <form onSubmit={handleCreateTask} className="flex-1 flex items-center space-x-2">
              <input 
                type="text" 
                value={newTaskText} 
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Crear una nueva tarea principal..."
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
              />
              <button 
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-4 py-2 shadow"
              >
                Añadir
              </button>
            </form>
          </div>

          {/* Grid de tareas */}
          {loadingTasks ? (
            <div className="flex justify-center py-20">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-slate-200 rounded-full mb-4"></div>
                <div className="text-slate-400 text-sm font-medium">Sincronizando tareas...</div>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-slate-200 rounded-lg bg-white/50 shadow-sm">
              <p className="text-slate-500 font-medium">El lienzo está en blanco.</p>
              <p className="text-slate-400 text-sm mt-1">Usa la barra superior para agregar tu primera tarea.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onAddSubtask={handleCreateSubtask} 
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Easter Egg Button */}
        <button 
          onClick={onEasterEgg}
          className="fixed bottom-4 right-4 w-8 h-8 opacity-0 hover:opacity-10 transition-opacity bg-amber-500 rounded-full cursor-pointer z-50"
          title="Secreto"
        />
      </main>
    </div>
  );
}

function TaskCard({ task, onAddSubtask, onDeleteTask }) {
  const [subText, setSubText] = useState('');

  const handleSub = (e) => {
    e.preventDefault();
    onAddSubtask(task.id, subText);
    setSubText('');
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm overflow-hidden group">
      <div className="p-6 flex flex-col space-y-1.5 border-b border-slate-100 relative">
        <div className="flex items-center space-x-2 pr-8">
          <div className="w-2 h-2 rounded-full bg-slate-900 flex-shrink-0"></div>
          <h3 className="font-semibold leading-none tracking-tight">{task.texto}</h3>
        </div>
        <button 
          onClick={() => onDeleteTask(task.id)}
          className="absolute top-5 right-4 text-slate-300 hover:text-red-500 transition-colors"
          title="Eliminar tarea"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
      
      <div className="p-6 pt-4">
        {task.subtareas.length === 0 ? (
          <p className="text-sm text-slate-500 mb-4">Sin dependencias asignadas.</p>
        ) : (
          <div className="mb-6 relative">
            <div className="absolute left-[7px] top-2 bottom-4 w-px bg-slate-200"></div>
            
            <ul className="space-y-4 relative z-10">
              {task.subtareas.map(sub => (
                <li key={sub.id} className="flex items-start justify-between text-sm group/sub">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-[15px] h-[15px] rounded-full bg-white border border-slate-200 flex items-center justify-center mt-0.5 z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    </div>
                    <div className="flex-1 text-slate-700 leading-tight mt-0.5">
                      {sub.texto}
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteTask(sub.id)}
                    className="text-slate-200 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-opacity"
                    title="Eliminar subtarea"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSub} className="flex items-center space-x-2">
          <input 
            type="text" 
            value={subText} 
            onChange={(e) => setSubText(e.target.value)}
            placeholder="Añadir subtarea..."
            className="flex h-8 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
          />
          <button 
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 bg-slate-100 text-slate-900 hover:bg-slate-200 h-8 px-3 shadow-sm"
          >
            Vincular
          </button>
        </form>
      </div>
    </div>
  );
}

export default TableroProyecto;
