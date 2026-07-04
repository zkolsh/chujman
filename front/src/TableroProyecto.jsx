/**
 * @fileoverview Tablero interactivo (Grafo) para gestionar tareas y subtareas de un proyecto
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ConfirmModal from './ConfirmModal';

function TaskNode({ id, data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [textVal, setTextVal] = useState(data.texto || '');

  const handleBlur = () => {
    setIsEditing(false);
    if (textVal !== data.texto) {
      data.onUpdate(id, { texto: textVal });
    }
  };

  const statusColors = {
    "No Iniciado": "bg-slate-50 border-slate-300",
    "En Progreso": "bg-purple-50 border-purple-400",
    "Completado": "bg-green-50 border-green-400 opacity-75"
  };

  return (
    <div className={`p-4 rounded-xl border-2 shadow-sm min-w-[220px] transition-all ${statusColors[data.estado] || statusColors["No Iniciado"]}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white" />

      <div className="flex flex-col space-y-3 relative">
        <button
          onClick={() => data.onDelete(id)}
          className="absolute -top-2 -right-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm"
          title="Eliminar tarea"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isEditing ? (
          <input
            autoFocus
            value={textVal}
            onChange={(e) => setTextVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            className="w-full text-sm font-semibold text-slate-800 bg-white border-b-2 border-blue-500 outline-none px-1 py-0.5 rounded-t"
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className={`text-sm font-semibold px-1 py-0.5 cursor-text ${data.estado === 'Completado' ? 'line-through text-slate-500' : 'text-slate-800'}`}
            title="Doble clic para editar"
          >
            {data.texto || 'Sin título'}
          </div>
        )}

        <select
          value={data.estado}
          onChange={(e) => data.onUpdate(id, { estado: e.target.value })}
          className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="No Iniciado">No Iniciado</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Completado">Completado</option>
        </select>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </div>
  );
}

const nodeTypes = { taskNode: TaskNode };

/**
 * Componente principal del espacio de trabajo. Renderiza el diagrama interactivo de nodos.
 * Maneja la lógica de "Estados Inteligentes" propagando los estados de las tareas hacia arriba (Ancestros) y hacia abajo (Descendientes en cascada).
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.project - Objeto con los datos del proyecto actual
 * @param {(project: Object) => void} props.onSelectProject - Función para cambiar de proyecto desde el sidebar
 * @param {() => void} props.onBackToDashboard - Función para volver al menú principal de proyectos
 * @param {() => void} props.onLogout - Función para cerrar la sesión actual
 * @param {() => void} props.onEasterEgg - Función secreta
 * @returns {JSX.Element}
 */

export default function TableroProyecto({ project, onSelectProject, onBackToDashboard, onLogout, onEasterEgg }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [projectsList, setProjectsList] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [loadingTasks, setLoadingTasks] = useState(true);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [projectNameError, setProjectNameError] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (project?.id) fetchGraphData();
  }, [project.id]);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok && data.success) setProjectsList(data.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmitNewProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) { setProjectNameError(true); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchProjects();
        onSelectProject(data.data);
        setIsCreateProjectModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteProject = async (projId) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Proyecto',
      message: '¿Seguro que quieres eliminar este proyecto por completo?',
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig({ ...confirmConfig, isOpen: false });
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projId}`, { method: 'DELETE', headers: authHeaders });
          if (res.ok) {
            projId === project.id ? onBackToDashboard() : fetchProjects();
          }
        } catch (err) { console.error(err); }
      }
    });
  };

  const fetchGraphData = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok && data.success) {
        const { nodes: dbNodes, edges: dbEdges } = data.data;

        const mappedNodes = dbNodes.map((n, i) => ({
          id: String(n.id),
          type: 'taskNode',
          position: { x: n.x ?? (250 + (i * 20)), y: n.y ?? (100 + (i * 20)) },
          data: {
            texto: n.texto,
            estado: n.estado,
            onUpdate: handleUpdateNode,
            onDelete: handleDeleteNode
          }
        }));

        const mappedEdges = dbEdges.map(e => ({
          id: `e${e.fromId}-${e.toId}`,
          source: String(e.fromId),
          target: String(e.toId),
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        }));

        setNodes(mappedNodes);
        setEdges(mappedEdges);
      }
    } catch (err) { console.error(err); } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateNode = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ texto: 'Nueva Tarea', estado: 'No Iniciado' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newNode = data.data;
        setNodes(nds => [...nds, {
          id: String(newNode.id),
          type: 'taskNode',
          position: { x: newNode.x ?? (window.innerWidth / 2 - 100), y: newNode.y ?? (window.innerHeight / 2 - 100) },
          data: {
            texto: newNode.texto,
            estado: newNode.estado,
            onUpdate: handleUpdateNode,
            onDelete: handleDeleteNode
          }
        }]);
      }
    } catch (err) { console.error(err); }
  };

  const nodesRef = React.useRef([]);
  const edgesRef = React.useRef([]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // Funciones de utilidad para Inteligencia del Grafo

  /**
   * Obtiene todos los nodos descendientes (subtareas, nietos, etc.) de manera recursiva
   * @param {string} nodeId - ID del nodo padre
   * @param {Array} allEdges - Lista de todas las aristas (conexiones) actuales
   * @param {Set} result - Set acumulador para recursión
   * @returns {Array<string>} Array con los IDs de todos los descendientes
   */

  const getDescendants = (nodeId, allEdges, result = new Set()) => {
    allEdges.forEach(e => {
      if (e.source === nodeId && !result.has(e.target)) {
        result.add(e.target);
        getDescendants(e.target, allEdges, result);
      }
    });
    return Array.from(result);
  };

  /**
   * Obtiene todos los nodos ancestros (padres, abuelos, etc.) de manera recursiva
   * @param {string} nodeId - ID del nodo hijo
   * @param {Array} allEdges - Lista de todas las aristas (conexiones) actuales
   * @param {Set} result - Set acumulador para recursión
   * @returns {Array<string>} Array con los IDs de todos los ancestros
   */

  const getAncestors = (nodeId, allEdges, result = new Set()) => {
    allEdges.forEach(e => {
      if (e.target === nodeId && !result.has(e.source)) {
        result.add(e.source);
        getAncestors(e.source, allEdges, result);
      }
    });
    return Array.from(result);
  };

  /**
   * Aplica los cambios de estado aplicando reglas de inteligencia (propagación hacia ancestros o descendientes).
   * Actualiza el estado local de React inmediatamente y luego sincroniza en paralelo con el Backend.
   * 
   * @param {string} nodeId - ID de la tarea principal modificada
   * @param {Object} updates - Objeto con los campos a actualizar (ej: { estado: 'Completado' })
   * @param {Array<string>} descendantsToUpdate - Lista de IDs de subtareas que deben heredar el cambio (propagación en cascada)
   */

  const applyStatusChanges = async (nodeId, updates, descendantsToUpdate = []) => {
    let nodesToUpdateMap = new Map();
    nodesToUpdateMap.set(nodeId, updates);

    // 1. Añadir descendientes a actualizar (ya sea a No Iniciado o Completado)
    descendantsToUpdate.forEach(descId => {
      nodesToUpdateMap.set(descId, { estado: updates.estado });
    });

    // 2. Propagación Inteligente hacia los Ancestros
    const ancestors = getAncestors(nodeId, edgesRef.current);
    ancestors.forEach(ancId => {
      const ancNode = nodesRef.current.find(n => n.id === ancId);
      if (!ancNode) return;

      const currentAncState = nodesToUpdateMap.has(ancId) ? nodesToUpdateMap.get(ancId).estado : ancNode.data.estado;

      if (updates.estado === 'No Iniciado') {
        // Si una subtarea vuelve a No Iniciado, el padre ya no puede estar Completado
        if (currentAncState === 'Completado') {
          nodesToUpdateMap.set(ancId, { estado: 'En Progreso' });
        }
      } else if (updates.estado === 'En Progreso') {
        // Si una subtarea arranca, el padre debe estar En Progreso (arrastramos a padres No Iniciados o reabrimos Completados)
        if (currentAncState !== 'En Progreso') {
          nodesToUpdateMap.set(ancId, { estado: 'En Progreso' });
        }
      } else if (updates.estado === 'Completado') {
        // Si la subtarea se completa, el padre pasa a En Progreso SOLO si estaba No Iniciado
        // (Si el padre ya estaba Completado o En Progreso, se mantiene igual)
        if (currentAncState === 'No Iniciado') {
          nodesToUpdateMap.set(ancId, { estado: 'En Progreso' });
        }
      }
    });

    const nodesToUpdate = Array.from(nodesToUpdateMap, ([id, val]) => ({ id, updates: val }));

    // Actualizar UI Local Inmediatamente (Optimistic UI)
    setNodes(nds => nds.map(node => {
      const updateReq = nodesToUpdateMap.get(node.id);
      if (updateReq) return { ...node, data: { ...node.data, ...updateReq } };
      return node;
    }));

    // Enviar al servidor de forma concurrente
    try {
      await Promise.all(nodesToUpdate.map(async (updateReq) => {
        await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${updateReq.id}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify(updateReq.updates)
        });
      }));
    } catch (err) { console.error('Error propagando estados:', err); }
  };

  const handleUpdateNode = async (nodeId, updates) => {
    // Si cambia texto, no hay lógica cruzada
    if (!updates.estado) {
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n));
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${nodeId}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify(updates)
        });
      } catch (err) { console.error(err); }
      return;
    }

    const descendants = getDescendants(nodeId, edgesRef.current);

    // Regla: Completado inteligente y silencioso
    if (updates.estado === 'Completado') {
      const uncompletedDescendants = descendants.filter(dId => {
        const dNode = nodesRef.current.find(n => n.id === dId);
        return dNode && dNode.data.estado !== 'Completado';
      });

      if (uncompletedDescendants.length > 0) {
        setConfirmConfig({
          isOpen: true,
          title: 'Completar Tarea en Cascada',
          message: '¿Estás seguro que quieres marcar la tarea como completada? Todas sus subtareas pendientes también se marcarán como completadas.',
          isDanger: false,
          onConfirm: async () => {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            await applyStatusChanges(nodeId, updates, uncompletedDescendants);
          }
        });
        return; // Esperamos confirmación
      }
      // Silencioso
      await applyStatusChanges(nodeId, updates, []);
      return;
    }

    // Regla: Reinicio total (No Iniciado)
    if (updates.estado === 'No Iniciado') {
      const startedDescendants = descendants.filter(dId => {
        const dNode = nodesRef.current.find(n => n.id === dId);
        return dNode && dNode.data.estado !== 'No Iniciado';
      });

      if (startedDescendants.length > 0) {
        setConfirmConfig({
          isOpen: true,
          title: 'Reinicio Total de la Tarea',
          message: 'Al pasar a "No Iniciado", todas sus subtareas también volverán a "No Iniciado". ¿Estás de acuerdo?',
          isDanger: true,
          onConfirm: async () => {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            await applyStatusChanges(nodeId, updates, startedDescendants);
          }
        });
        return; // Esperamos confirmación
      }

      await applyStatusChanges(nodeId, updates, []);
      return;
    }

    // Si cambia a "En Progreso", no hay modal hacia abajo, pero arrastra al padre hacia arriba
    await applyStatusChanges(nodeId, updates, []);
  };

  const handleDeleteNode = (nodeId) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Tarea',
      message: '¿Estás seguro de eliminar esta tarea? Se eliminarán también sus conexiones.',
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setNodes(nds => nds.filter(n => n.id !== nodeId));
        setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));

        try {
          await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${nodeId}`, {
            method: 'DELETE',
            headers: authHeaders
          });
        } catch (err) { console.error(err); }
      }
    });
  };

  const onConnect = useCallback(async (params) => {
    if (params.source === params.target) return;

    const newEdgeId = `e${params.source}-${params.target}`;
    const visualEdge = { ...params, id: newEdgeId, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } };
    setEdges(eds => addEdge(visualEdge, eds));

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/relations`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ fromId: parseInt(params.source), toId: parseInt(params.target) })
      });

      // Regla: Trabajo nuevo reabre tareas
      const parentNode = nodesRef.current.find(n => n.id === params.source);
      if (parentNode && parentNode.data.estado === 'Completado') {
        await applyStatusChanges(params.source, { estado: 'En Progreso' });
      }
    } catch (err) { console.error(err); }
  }, [project.id]);

  const onNodeDragStop = useCallback(async (_event, node) => {
    const { x, y } = node.position;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/tasks/${node.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ x: Math.round(x), y: Math.round(y) })
      });
    } catch (err) { console.error(err); }
  }, [project.id]);

  const onEdgesDelete = useCallback(async (edgesToDelete) => {
    edgesToDelete.forEach(async (edge) => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/projects/${project.id}/relations`, {
          method: 'DELETE',
          headers: authHeaders,
          body: JSON.stringify({ fromId: parseInt(edge.source), toId: parseInt(edge.target) })
        });
      } catch (err) { console.error(err); }
    });
  }, [project.id]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <aside className={`bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden opacity-0'}`}>
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50 min-w-[16rem]">
          <div className="font-bold text-white tracking-tight truncate">
            Hola, {localStorage.getItem('userName') || 'Usuario'}
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto min-w-[16rem]">
          <button onClick={onBackToDashboard} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mb-6">
            <span>&larr;</span> Volver al menú
          </button>

          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tus Proyectos</h3>
            <button onClick={() => setIsCreateProjectModalOpen(true)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
          </div>

          <ul className="space-y-1">
            {projectsList.map(p => (
              <li key={p.id} className="relative group/proj">
                <button onClick={() => onSelectProject(p)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors pr-8 ${p.id === project.id ? 'bg-slate-800 text-white font-medium' : 'hover:bg-slate-800 hover:text-white'}`}>
                  <div className="truncate">{p.name}</div>
                </button>
                <button onClick={() => handleDeleteProject(p.id)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 opacity-0 group-hover/proj:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30 min-w-[16rem]">
          <button onClick={onLogout} className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors border border-slate-700">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen relative">
        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm w-10 h-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              </button>
            )}
            <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
              <h1 className="text-xl font-bold text-slate-800">{project.name}</h1>
              {project.description && <p className="text-xs text-slate-500 mt-1">{project.description}</p>}
            </div>
          </div>

          <button
            onClick={handleCreateNode}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-md hover:bg-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Agregar Tarea
          </button>
        </div>

        <div className="flex-1 w-full h-full bg-slate-50">
          {loadingTasks ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="animate-pulse h-8 w-8 bg-blue-500 rounded-full"></div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgesDelete={onEdgesDelete}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              maxZoom={2}
            >
              <Controls className="bg-white border-slate-200 shadow-md" />
              <MiniMap
                nodeColor={(node) => {
                  if (node.data?.estado === 'Completado') return '#22c55e';
                  if (node.data?.estado === 'En Progreso') return '#a855f7';
                  return '#cbd5e1';
                }}
                maskColor="rgba(248, 250, 252, 0.7)"
                className="bg-white border-slate-200 shadow-md rounded-lg"
              />
              <Background color="#cbd5e1" gap={16} size={2} />
            </ReactFlow>
          )}
        </div>

        <button onClick={onEasterEgg} className="fixed bottom-4 right-4 w-8 h-8 opacity-0 hover:opacity-10 transition-opacity bg-amber-500 rounded-full cursor-pointer z-50" />
      </main>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDanger={confirmConfig.isDanger}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">Nuevo Proyecto</h2>
              <button onClick={() => setIsCreateProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmitNewProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => { setNewProjectName(e.target.value); if (e.target.value.trim()) setProjectNameError(false); }}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" autoFocus
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsCreateProjectModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-slate-900 rounded-md">Crear Proyecto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}