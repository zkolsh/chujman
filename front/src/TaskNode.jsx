/**
 * @fileoverview Nodo de grafo para representar tareas con diferentes estados
 */

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

export default function TaskNode({ id, data }) {
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
            className={`text-sm font-semibold px-1 py-0.5 cursor-text ${data.data?.estado === 'Completado' || data.estado === 'Completado' ? 'line-through text-slate-500' : 'text-slate-800'}`}
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

        <div className="flex flex-col space-y-1 mt-2 border-t border-slate-100 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Fecha Límite {data.deadline ? '' : '(Sin Asignar)'}
            </label>
            {data.deadline && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onUpdate(id, { deadline: null });
                }}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Quitar ×
              </button>
            )}
          </div>
          <input
            type="date"
            value={data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : ''}
            onChange={(e) => data.onUpdate(id, { deadline: e.target.value || null })}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </div>
  );
}