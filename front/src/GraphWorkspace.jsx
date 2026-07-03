/**
 * @fileoverview Área de trabajo principal para visualizar e interactuar con el grafo de tareas
 */

import React, { useCallback, useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import TaskNode from './TaskNode';

import '@xyflow/react/dist/style.css';

const nodeTypes = { taskNode: TaskNode };

/**
 * Componente que renderiza el grafo interactivo usando React Flow.
 * Maneja los nodos (tareas) y las aristas (relaciones).
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.initialArchivos - Lista inicial de nodos/archivos a renderizar
 * @param {Array} props.initialRelaciones - Lista inicial de relaciones/aristas entre nodos
 * @param {(data: Object) => void} props.onSyncWithDatabase - Función para guardar la topología actual
 * @returns {JSX.Element}
 */

export default function GraphWorkspace({ initialArchivos, initialRelaciones, onSyncWithDatabase }) {
  const mappedNodes = useMemo(() => {
    return initialArchivos.map((archivo) => ({
      id: String(archivo.id),
      type: 'taskNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        id: archivo.id,
        label: archivo.texto || `Node #${archivo.id}`,
        estado: archivo.estado,
        onStatusChange: (id, newEstado) => handleStatusUpdate(id, newEstado)
      }
    }));
  }, [initialArchivos]);

  const mappedEdges = useMemo(() => {
    return initialRelaciones.map((rel) => ({
      id: `e-${rel.fromId}-${rel.toId}`,
      source: String(rel.fromId),
      target: String(rel.toId),
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 },
    }));
  }, [initialRelaciones]);

  const [nodes, setNodes, onNodesChange] = useNodesState(mappedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mappedEdges);

  const handleStatusUpdate = (nodeId, newEstado) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.data.id === nodeId) {
          return { ...node, data: { ...node.data, estado: newEstado } };
        }
        return node;
      })
    );
  };

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6' } }, eds));
      console.log(`creada arista from ${params.source} to ${params.target}`);
    },
    [setEdges]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete) => {
      edgesToDelete.forEach(edge => {
        console.log(`eliminada arista from ${edge.source} to ${edge.target}`);
      });
    },
    []
  );

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        {/* <h1 className="text-xl font-bold tracking-tight text-white">Project Graph Prototype</h1> */}
        <button onClick={() => onSyncWithDatabase({ nodes, edges })} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold transition" >
          Guardar Topologia
        </button>
      </header>

      <div className="flex-1 w-full h-full">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onEdgesDelete={onEdgesDelete} nodeTypes={nodeTypes} fitView >
          <Controls className="bg-slate-900 border border-slate-700 text-slate-200 fill-slate-200" />
          <MiniMap nodeColor="#1e293b" backgroundColor="#020617" maskColor="rgba(0,0,0,0.3)" />
          <Background color="#334155" gap={16} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}