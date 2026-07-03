/**
 * @fileoverview Nodo de grafo para representar tareas con diferentes estados
 */

import React from 'react';
import { Handle, Position } from '@xyflow/react';

const statusColors = {
  "No Iniciado": "bg-slate-800 border-slate-600 text-slate-300",
  "En Progreso": "bg-blue-950 border-blue-500 text-blue-200",
  "Completado": "bg-emerald-950 border-emerald-500 text-emerald-200"
};

/**
 * Componente personalizado de React Flow que representa una tarea.
 * Permite visualizar el estado y cambiarlo mediante un select.
 * 
 * @param {Object} props - Las propiedades del componente provistas por React Flow
 * @param {Object} props.data - Datos inyectados en el nodo
 * @param {string} props.data.id - Identificador único de la tarea
 * @param {string} props.data.label - Nombre o título de la tarea
 * @param {string} props.data.estado - Estado actual de la tarea
 * @param {(id: string, newStatus: string) => void} props.data.onStatusChange - Función para actualizar el estado en el padre
 * @returns {JSX.Element}
 * 
 * @example
 * <TaskNode
 *   data={{
 *     id: "t1",
 *     label: "Configurar Base de Datos",
 *     estado: "En Progreso",
 *     onStatusChange: (id, nuevoEstado) => console.log(`La tarea ${id} ahora está ${nuevoEstado}`)
 *   }}
 * />
 */

export default function TaskNode({ data }) {
  return (
    <div className={`px-4 py-3 shadow-xl rounded-lg border-2 min-w-[200px] ${statusColors[data.estado] || 'bg-slate-800'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400 border-2 border-slate-900 rounded-full" />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Name</label>
        <div className="text-sm font-semibold truncate">{data.label}</div>

        { }
        <select value={data.estado} onChange={(e) => data.onStatusChange(data.id, e.target.value)} className="mt-1 block w-full text-xs bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 focus:outline-none focus:border-blue-500" >
          <option value="No Iniciado">No Iniciado</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Completado">Completado</option>
        </select>
      </div>

      { }
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
    </div>
  );
}