/**
 * @fileoverview Panel lateral para visualizar y editar la descripción y detalles de una tarea
 */

import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';

/**
 * Componente que renderiza el panel lateral de detalle de una tarea.
 * Permite editar el título, estado, fecha límite y descripción en formato Markdown.
 *
 * @param {Object} props
 * @param {Object|null} props.node - Nodo seleccionado (tarea)
 * @param {() => void} props.onClose - Función para cerrar el panel
 * @param {(id: string|number, updates: Object) => void} props.onUpdate - Función para guardar cambios
 * @param {(id: string|number) => void} [props.onDelete] - Función para eliminar la tarea
 * @returns {JSX.Element|null}
 */
export default function TaskDetailPane({ node, onClose, onUpdate, onDelete }) {
  const nodeData = node?.data || {};
  const [texto, setTexto] = useState(nodeData.texto || '');
  const [descripcion, setDescripcion] = useState(nodeData.descripcion || '');
  const [estado, setEstado] = useState(nodeData.estado || 'No Iniciado');
  const [previewMode, setPreviewMode] = useState('preview'); // Iniciar en vista previa por defecto

  if (!node) return null;

  const handleTitleBlur = () => {
    if (texto !== (node.data?.texto || '')) {
      onUpdate(node.id, { texto });
    }
  };

  const handleDescriptionChange = (val) => {
    const newDesc = val || '';
    setDescripcion(newDesc);
    onUpdate(node.id, { descripcion: newDesc });
  };

  const handleEstadoChange = (newEstado) => {
    setEstado(newEstado);
    onUpdate(node.id, { estado: newEstado });
  };

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-96 md:w-[460px] bg-white shadow-2xl border-l border-slate-200 z-40 flex flex-col transition-transform duration-200 ease-in-out">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tarea #{node.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => {
                onDelete(node.id);
                onClose();
              }}
              className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
              title="Eliminar tarea"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 transition-colors"
            title="Cerrar panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Título */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Título
          </label>
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            placeholder="Título de la tarea..."
            className="w-full text-base font-semibold text-slate-900 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => handleEstadoChange(e.target.value)}
            className="w-full text-sm font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="No Iniciado">No Iniciado</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Completado">Completado</option>
          </select>
        </div>

        {/* Descripción con react-md-editor (sin split-pane) */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Descripción / Contenido
            </label>
            <div className="flex rounded-md bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setPreviewMode('preview')}
                className={`px-2.5 py-1 rounded transition-colors ${previewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'}`}
              >
                Vista Previa
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('edit')}
                className={`px-2.5 py-1 rounded transition-colors ${previewMode === 'edit' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'}`}
              >
                Editar
              </button>
            </div>
          </div>

          {previewMode === 'preview' ? (
            <div data-color-mode="light" className="p-4 bg-white border border-slate-200 rounded-lg min-h-[320px] max-h-[420px] overflow-y-auto shadow-inner text-sm">
              <MDEditor.Markdown
                source={descripcion || '*Sin descripción. Haz clic en "Editar" para redactar contenido.*'}
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
          ) : (
            <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden shadow-inner bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              {/* Barra de herramientas Markdown */}
              <div className="flex items-center gap-1 p-1.5 bg-slate-50 border-b border-slate-200 text-slate-600 text-xs flex-wrap select-none">
                <button
                  type="button"
                  onClick={() => {
                    const next = descripcion ? `${descripcion}\n**texto en negrita**` : '**texto en negrita**';
                    handleDescriptionChange(next);
                  }}
                  className="px-2 py-1 hover:bg-slate-200 rounded font-bold"
                  title="Negrita"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = descripcion ? `${descripcion}\n*texto en cursiva*` : '*texto en cursiva*';
                    handleDescriptionChange(next);
                  }}
                  className="px-2 py-1 hover:bg-slate-200 rounded italic"
                  title="Cursiva"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = descripcion ? `${descripcion}\n# Encabezado` : '# Encabezado';
                    handleDescriptionChange(next);
                  }}
                  className="px-2 py-1 hover:bg-slate-200 rounded font-semibold"
                  title="Título"
                >
                  H
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = descripcion ? `${descripcion}\n- Elemento de lista` : '- Elemento de lista';
                    handleDescriptionChange(next);
                  }}
                  className="px-2 py-1 hover:bg-slate-200 rounded"
                  title="Lista"
                >
                  • Lista
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = descripcion ? `${descripcion}\n\`\`\`\nconsole.log('código');\n\`\`\`` : "```\nconsole.log('código');\n```";
                    handleDescriptionChange(next);
                  }}
                  className="px-2 py-1 hover:bg-slate-200 rounded font-mono text-[11px]"
                  title="Bloque de código"
                >
                  &lt;/&gt;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = descripcion ? `${descripcion}\n[Texto del enlace](https://)` : '[Texto del enlace](https://)';
                    handleDescriptionChange(next);
                  }}
                  className="px-2 py-1 hover:bg-slate-200 rounded"
                  title="Enlace"
                >
                  🔗
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = descripcion ? `${descripcion}\n> Cita` : '> Cita';
                    handleDescriptionChange(next);
                  }}
                  className="px-2 py-1 hover:bg-slate-200 rounded"
                  title="Cita"
                >
                  ”
                </button>
              </div>

              {/* Textarea sin overlays desincronizados */}
              <textarea
                value={descripcion}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Escribe contenido en formato Markdown aquí..."
                rows={12}
                className="w-full p-3 font-mono text-sm leading-relaxed text-slate-800 bg-white border-none outline-none resize-y min-h-[260px]"
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  letterSpacing: 'normal'
                }}
              />
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            Soporta formato Markdown (encabezados, listas, negritas, código, enlaces, etc.).
          </p>
        </div>
      </div>
    </aside>
  );
}
