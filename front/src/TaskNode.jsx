/**
 * @fileoverview Nodo de grafo para representar tareas con diferentes estados
 */

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

export default function TaskNode({ id, data, selected }) {
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

  const hasDescription = Boolean(data.descripcion && data.descripcion.trim());

  return (
    <div
      onClick={() => {
        // If clicking on the node body, notify parent to open pane if provided
        if (data.onSelectNode) {
          data.onSelectNode(id);
        }
      }}
      className={`p-4 rounded-xl border-2 shadow-sm min-w-[220px] max-w-[280px] transition-all cursor-pointer ${
        selected ? 'ring-2 ring-blue-500 shadow-md' : ''
      } ${statusColors[data.estado] || statusColors["No Iniciado"]}`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white" />

      <div className="flex flex-col space-y-3 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete(id);
          }}
          className="absolute -top-2 -right-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm cursor-pointer z-10"
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
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setTextVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            className="w-full text-sm font-semibold text-slate-800 bg-white border-b-2 border-blue-500 outline-none px-1 py-0.5 rounded-t"
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className={`text-sm font-semibold px-1 py-0.5 truncate cursor-text ${data.data?.estado === 'Completado' || data.estado === 'Completado' ? 'line-through text-slate-500' : 'text-slate-800'}`}
            title="Doble clic para editar título"
          >
            {data.texto || 'Sin título'}
          </div>
        )}

        {/* Indicador compacto de descripción (no renderiza texto masivo en el lienzo) */}
        {hasDescription && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-700 bg-blue-50/90 border border-blue-200/70 rounded-md px-2 py-1 select-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-600 shrink-0">
              <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" />
            </svg>
            <span className="truncate">Ver descripción</span>
          </div>
        )}

        <select
          value={data.estado}
          onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => e.stopPropagation()}
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