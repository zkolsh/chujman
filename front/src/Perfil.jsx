/**
 * @fileoverview Componente principal para gestionar el perfil del usuario, suscripción y facturas.
 */

import React, { useState, useEffect } from 'react';

/**
 * Componente de Perfil de Usuario con diseño premium
 * 
 * @param {Object} props
 * @param {Function} props.onBack - Función para volver al dashboard
 * @param {Function} props.onUpgrade - Función para abrir la pantalla de Pricing
 * @param {Function} props.onPrintInvoice - Función para ver/imprimir una factura (recibe id)
 * @returns {JSX.Element}
 */
const Perfil = ({ onBack, onUpgrade, onPrintInvoice }) => {
  const [user, setUser] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#1e293b');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const getAvatarColor = (str) => {
    if (!str) return 'bg-purple-600';
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
      'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500',
      'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
      'bg-pink-500', 'bg-rose-500'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    fetchProfile();
    fetchFacturas();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setNewName(data.data.name);
        setNewColor(data.data.bannerColor || '#1e293b');
      }
    } catch (error) {
      console.error("Error cargando perfil", error);
    }
  };

  const fetchFacturas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/me/facturas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFacturas(data.data);
      }
    } catch (error) {
      console.error("Error cargando facturas", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName, bannerColor: newColor })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Perfil actualizado exitosamente');
        localStorage.setItem('userName', newName); // Sync con app
        setUser(data.data);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error("Error actualizando perfil", error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  const planName = user.nivelSuscripcion || 'Gratis';
  const isPremium = planName !== 'Gratis';
  const badgeColor = isPremium
    ? 'bg-amber-100 text-amber-800 border border-amber-200'
    : 'bg-slate-100 text-slate-700 border border-slate-200';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">

      {/* Navbar Minimalista */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="text-sm font-medium text-slate-500 tracking-tight">Tu Perfil</div>
        <button
          onClick={onBack}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver al espacio
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">

        {/* Banner y Tarjeta Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 relative">
          {/* Banner con color dinámico */}
          <div className="h-32 w-full transition-colors duration-300" style={{ backgroundColor: user.bannerColor || '#1e293b' }}></div>

          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-6 sm:mb-0">
                <div className="h-24 w-24 -mt-12 rounded-full bg-white p-1 shadow-md overflow-hidden relative flex-shrink-0 z-10">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className={`h-full w-full rounded-full ${getAvatarColor(user.gmail)} flex items-center justify-center text-3xl font-bold text-white uppercase shadow-inner`}>
                      {user.name ? user.name.charAt(0) : user.gmail.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="mb-2 mt-4 sm:mt-2 pt-2 sm:pt-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                  <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    {user.gmail}
                  </p>
                </div>
              </div>

              {/* Área Superior - Solo Badge */}
              <div className="flex-shrink-0 flex flex-col items-end">
                <div className={`px-4 py-1.5 rounded-md font-semibold text-xs tracking-wider inline-block mb-3 ${badgeColor}`}>
                  PLAN {planName.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna Izquierda: Detalles del Plan */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
                Tu Suscripción
              </h3>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Plan actual</p>
                <p className="text-xl font-bold text-slate-800">{planName}</p>

                {user.fechaVencimientoSuscripcion && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">{user.suscripcionCancelada ? 'Finaliza el' : user.nextNivelSuscripcion ? 'Cambia de plan el' : 'Próxima renovación'}</p>
                    <p className={`font-medium flex items-center gap-2 ${user.suscripcionCancelada || user.nextNivelSuscripcion ? 'text-amber-600' : 'text-slate-800'}`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {new Date(user.fechaVencimientoSuscripcion).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {user.suscripcionCancelada && <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full ml-1">CANCELA A GRATIS</span>}
                      {user.nextNivelSuscripcion && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-1">PASA A {user.nextNivelSuscripcion.toUpperCase()}</span>}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={onUpgrade}
                className="mt-4 w-full py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors"
              >
                Cambiar de Plan
              </button>
            </div>
          </div>

          {/* Columna Derecha: Formulario y Facturas */}
          <div className="lg:col-span-2 space-y-8">

            {/* Formulario Perfil */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Información Personal</h3>

              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre para mostrar</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>

                  {/* Selector de Color de Banner */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      Personalizar Color de Portada
                      {!isPremium && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium tracking-tight">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          PREMIUM
                        </span>
                      )}
                    </label>
                    <div className="flex items-center gap-4">
                      <div className={`relative ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="color"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          disabled={!isPremium}
                          title={!isPremium ? "Requiere un plan Premium" : "Elige un color para tu portada"}
                          className="h-10 w-20 cursor-pointer rounded overflow-hidden"
                        />
                      </div>
                      <span className="text-sm text-slate-500 font-mono bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                        {newColor.toUpperCase()}
                      </span>
                    </div>
                    {!isPremium && (
                      <p className="mt-2 text-xs text-slate-500">
                        Actualizá a cualquier plan de pago para poder elegir el color que prefieras.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="h-6">
                    {message && (
                      <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {message}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={saving || (newName === user.name && newColor === user.bannerColor)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>

            {/* Facturas */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Historial de Facturación
              </h3>

              {facturas.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                  <p className="mt-4 text-sm font-medium text-slate-900">No hay facturas</p>
                  <p className="mt-1 text-sm text-slate-500">Aún no has realizado ningún pago en la plataforma.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {facturas.map(factura => (
                        <tr key={factura.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {new Date(factura.createdAt).toLocaleDateString('es-AR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Factura {factura.tipo}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            ${factura.total.toLocaleString('es-AR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => onPrintInvoice(factura.id)}
                              className="text-indigo-600 hover:text-indigo-900 font-semibold flex items-center justify-end gap-1 w-full opacity-70 group-hover:opacity-100 transition-opacity"
                            >
                              Ver PDF
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
