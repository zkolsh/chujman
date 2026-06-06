import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

function TableroProyecto({ project, onSelectProject, onBackToDashboard, onLogout, onEasterEgg }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [projectNameError, setProjectNameError] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

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
            estado: root.estado,
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
        // Si el padre estaba completado, lo pasamos a En Progreso porque tiene trabajo nuevo
        const parentTask = tasks.find(t => t.id === taskId);
        if (parentTask && parentTask.estado === 'Completado') {
          await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ estado: 'En Progreso' })
          });
        }
        
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId, isSubtask = false) => {
    setConfirmConfig({
      isOpen: true,
      title: isSubtask ? 'Eliminar Subtarea' : 'Eliminar Tarea Principal',
      message: isSubtask 
        ? '¿Seguro que quieres eliminar esta subtarea?' 
        : '¿Seguro que quieres eliminar esta tarea principal y todas sus subtareas asociadas?',
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig({ ...confirmConfig, isOpen: false });
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
      }
    });
  };

  const handleUpdateTaskStatus = async (taskId, nuevoEstado, subtareas = [], parentId = null) => {
    
    // Función auxiliar para continuar con el update
    const executeUpdate = async () => {
      // Si cambia a completado y tiene subtareas, actualizar todas
      if (nuevoEstado === 'Completado' && subtareas && subtareas.length > 0) {
        for (const sub of subtareas) {
          if (sub.estado !== 'Completado') {
            await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${sub.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: JSON.stringify({ estado: 'Completado' })
            });
          }
        }
      }

      // Si cambia a "No Iniciado" y tiene subtareas, resetear todas
      if (nuevoEstado === 'No Iniciado' && subtareas && subtareas.length > 0) {
        for (const sub of subtareas) {
          if (sub.estado !== 'No Iniciado') {
            await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${sub.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: JSON.stringify({ estado: 'No Iniciado' })
            });
          }
        }
      }

      // Si es una subtarea que pasa a "En Progreso" o "Completado", y el padre está "No Iniciado", lo pasamos a "En Progreso"
      if ((nuevoEstado === 'En Progreso' || nuevoEstado === 'Completado') && parentId) {
        const parentTask = tasks.find(t => t.id === parentId);
        if (parentTask && parentTask.estado === 'No Iniciado') {
          await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${parentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ estado: 'En Progreso' })
          });
        }
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          fetchTasks();
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Validar si necesitamos pedir confirmación
    if (nuevoEstado === 'Completado' && subtareas && subtareas.length > 0) {
      const hayNoCompletadas = subtareas.some(sub => sub.estado !== 'Completado');
      if (hayNoCompletadas) {
        setConfirmConfig({
          isOpen: true,
          title: 'Marcar como Completado',
          message: '¿Estás seguro? Todas las subtareas se marcarán también como completadas.',
          onConfirm: () => {
            setConfirmConfig({ ...confirmConfig, isOpen: false });
            executeUpdate();
          }
        });
        return;
      }
    }

    if (nuevoEstado === 'No Iniciado' && subtareas && subtareas.length > 0) {
      const hayIniciadas = subtareas.some(sub => sub.estado !== 'No Iniciado');
      if (hayIniciadas) {
        setConfirmConfig({
          isOpen: true,
          title: 'Volver a No Iniciado',
          message: 'Si la tarea principal vuelve a "No Iniciado", todas sus subtareas también volverán a "No Iniciado". ¿Estás de acuerdo?',
          onConfirm: () => {
            setConfirmConfig({ ...confirmConfig, isOpen: false });
            executeUpdate();
          }
        });
        return;
      }
    }

    // Si no hay confirmación pendiente, ejecutamos de una vez
    executeUpdate();
  };

  const handleOpenCreateProject = () => {
    setNewProjectName('');
    setNewProjectDesc('');
    setProjectNameError(false);
    setIsCreateProjectModalOpen(true);
  };

  const handleSubmitNewProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
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
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        fetchProjects();
        onSelectProject(data.data);
        setIsCreateProjectModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projId) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Proyecto',
      message: '¿Seguro que quieres eliminar este proyecto por completo? Esta acción no se puede deshacer.',
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig({ ...confirmConfig, isOpen: false });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (response.ok && data.success) {
            if (projId === project.id) {
              onBackToDashboard();
            } else {
              fetchProjects();
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
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

          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tus Proyectos</h3>
            <button
              onClick={handleOpenCreateProject}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
              title="Crear Proyecto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          <ul className="space-y-1">
            {projectsList.map(p => (
              <li key={p.id} className="relative group/proj">
                <button
                  onClick={() => onSelectProject(p)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors pr-8 ${p.id === project.id ? 'bg-slate-800 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                  <div className="truncate">{p.name}</div>
                </button>
                <button
                  onClick={() => handleDeleteProject(p.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 opacity-0 group-hover/proj:opacity-100 transition-opacity"
                  title="Eliminar proyecto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
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

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
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
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-base text-slate-500 mt-2">{project.description}</p>
            )}
          </div>

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
                  onUpdateStatus={handleUpdateTaskStatus}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onEasterEgg}
          className="fixed bottom-4 right-4 w-8 h-8 opacity-0 hover:opacity-10 transition-opacity bg-amber-500 rounded-full cursor-pointer z-50"
          title="Secreto"
        />
      </main>

      {/* Modal Crear Proyecto */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Nuevo Proyecto</h2>
              <button onClick={() => setIsCreateProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmitNewProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del proyecto <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newProjectName} 
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    if (e.target.value.trim()) setProjectNameError(false);
                  }}
                  className={`w-full h-10 px-3 rounded-md border ${projectNameError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-900'} focus:outline-none focus:ring-2 text-sm transition-shadow`}
                  placeholder="Ej. Rediseño Web"
                  autoFocus
                />
                {projectNameError && (
                  <p className="text-xs text-red-500 mt-1">El nombre del proyecto es obligatorio.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <textarea 
                  value={newProjectDesc} 
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm resize-none transition-shadow"
                  placeholder="Breve descripción del objetivo..."
                  rows={3}
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreateProjectModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

function StatusSelect({ value, onChange }) {
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      case 'En Progreso':
        return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
    }
  };

  const status = value || 'No Iniciado';

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs font-semibold rounded-md px-2 py-1 h-7 border cursor-pointer outline-none transition-colors appearance-none ${getStatusClasses(status)}`}
      style={{ paddingRight: '1.5rem', backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
    >
      <option value="No Iniciado" className="bg-white text-slate-800">No Iniciado</option>
      <option value="En Progreso" className="bg-white text-slate-800">En Progreso</option>
      <option value="Completado" className="bg-white text-slate-800">Completado</option>
    </select>
  );
}

function TaskCard({ task, onAddSubtask, onDeleteTask, onUpdateStatus }) {
  const [subText, setSubText] = useState('');

  const handleSub = (e) => {
    e.preventDefault();
    onAddSubtask(task.id, subText);
    setSubText('');
  };

  const isTaskCompleted = task.estado === 'Completado';

  return (
    <div className={`rounded-xl border ${isTaskCompleted ? 'border-green-100 bg-slate-50/50' : 'border-slate-200 bg-white'} text-slate-950 shadow-sm overflow-hidden group transition-colors`}>
      <div className={`p-6 flex flex-col space-y-1.5 border-b ${isTaskCompleted ? 'border-green-100/50' : 'border-slate-100'} relative`}>
        <div className="flex items-start justify-between pr-8">
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${task.estado === 'Completado' ? 'bg-green-500' : task.estado === 'En Progreso' ? 'bg-purple-500' : 'bg-slate-900'} flex-shrink-0`}></div>
            <h3 className={`font-semibold leading-none tracking-tight ${isTaskCompleted ? 'line-through text-slate-400' : ''}`}>{task.texto}</h3>
          </div>
          <div className="ml-2">
            <StatusSelect
              value={task.estado}
              onChange={(newStatus) => onUpdateStatus(task.id, newStatus, task.subtareas)}
            />
          </div>
        </div>
        <button
          onClick={() => onDeleteTask(task.id, false)}
          className="absolute top-5 right-4 text-slate-300 hover:text-red-500 transition-colors"
          title="Eliminar tarea principal"
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
            <div className={`absolute left-[7px] top-2 bottom-4 w-px ${isTaskCompleted ? 'bg-green-100' : 'bg-slate-200'}`}></div>

            <ul className="space-y-4 relative z-10">
              {task.subtareas.map(sub => {
                const isSubCompleted = sub.estado === 'Completado';
                const isSubInProgress = sub.estado === 'En Progreso';
                return (
                  <li key={sub.id} className="flex items-start justify-between text-sm group/sub">
                    <div className="flex items-start space-x-3 w-full">
                      <div className={`flex-shrink-0 w-[15px] h-[15px] rounded-full bg-white border ${isSubCompleted ? 'border-green-400' : isSubInProgress ? 'border-purple-400' : 'border-slate-200'} flex items-center justify-center mt-0.5 z-10`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isSubCompleted ? 'bg-green-500' : isSubInProgress ? 'bg-purple-500' : 'bg-slate-400'}`}></div>
                      </div>
                      <div className="flex-1 text-slate-700 leading-tight mt-0.5 flex justify-between items-start">
                        <span className={`pr-2 ${isSubCompleted ? 'line-through text-slate-400' : ''}`}>{sub.texto}</span>
                        <StatusSelect
                          value={sub.estado}
                          onChange={(newStatus) => onUpdateStatus(sub.id, newStatus, null, task.id)}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteTask(sub.id, true)}
                      className="ml-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-colors"
                      title="Eliminar subtarea"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </li>
                );
              })}
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
