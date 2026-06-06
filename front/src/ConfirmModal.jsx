import React from 'react';

function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, isDanger }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{title || 'Confirmar acción'}</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
        <div className="px-6 py-4 flex justify-end space-x-3 bg-slate-50/50 border-t border-slate-50">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {cancelText || 'Cancelar'}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDanger ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600' : 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-900'}`}
          >
            {confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
