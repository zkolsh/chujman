/**
 * @fileoverview Modal de pago para completar la suscripción.
 */

import React, { useState } from 'react';

/**
 * Componente modal para ingresar datos de pago (simulado) y confirmar suscripción.
 * 
 * @param {Object} props
 * @param {Object} props.plan - Plan seleccionado
 * @param {string} props.periodo - 'mensual' o 'anual'
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función que se ejecuta al completar el pago
 */
const CheckoutModal = ({ plan, periodo, onClose, onSuccess }) => {
  const [metodoPago, setMetodoPago] = useState('tarjeta'); // 'tarjeta' o 'mercadopago'
  const [formData, setFormData] = useState({
    // Datos tarjeta
    nombreTarjeta: '',
    numeroTarjeta: '',
    vencimiento: '',
    cvv: '',
    // Datos mercadopago
    mpAlias: '',
    mpEmail: '',
    // Comunes
    condicionIva: 'consumidor_final',
    cuit: '',
    nombreFacturacion: ''
  });
  
  const [errores, setErrores] = useState({});
  const [procesando, setProcesando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const montoUsd = periodo === 'anual' ? plan.precioAnual : plan.precioMensual;

  const validarDocumento = (doc, condicion) => {
    const clean = doc.replace(/[-.\s]/g, '');
    if (condicion === 'monotributista') return /^\d{11}$/.test(clean);
    return /^\d{7,8}$/.test(clean); // Exactamente 7 u 8 dígitos para DNI
  };
  const validarTarjeta = (numero) => /^\d{16}$/.test(numero.replace(/[\s-]/g, ''));
  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errores[name]) setErrores({ ...errores, [name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError('');
    
    const nuevosErrores = {};
    
    if (metodoPago === 'tarjeta') {
      if (!formData.nombreTarjeta.trim()) nuevosErrores.nombreTarjeta = true;
      if (!validarTarjeta(formData.numeroTarjeta)) nuevosErrores.numeroTarjeta = true;
      if (!formData.vencimiento.trim()) nuevosErrores.vencimiento = true;
      if (!/^\d{3,4}$/.test(formData.cvv)) nuevosErrores.cvv = true;
    } else {
      if (!formData.mpAlias.trim()) nuevosErrores.mpAlias = true;
      if (!validarEmail(formData.mpEmail)) nuevosErrores.mpEmail = true;
    }
    
    // Validar datos de facturación
    if (!formData.nombreFacturacion.trim()) nuevosErrores.nombreFacturacion = true;
    if (!formData.cuit.trim() || !validarDocumento(formData.cuit, formData.condicionIva)) nuevosErrores.cuit = true;

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setProcesando(true);

    try {
      const token = localStorage.getItem('token');
      const cuitLimpio = formData.cuit ? formData.cuit.replace(/[-.\s]/g, '') : '';
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: plan.nombre,
          periodo: periodo,
          amountUsd: montoUsd,
          cuit: cuitLimpio,
          nombreFacturacion: formData.nombreFacturacion,
          condicionIva: formData.condicionIva
        })
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setMensajeError(data.message || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error(error);
      setMensajeError('Error de red. Intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      
      {/* Overlay oscuro para fondo (ahora clickeable y seguro) */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Principal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Cabecera del Modal con Botón de Cierre */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Pago Seguro
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
              title="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8">
            
            {/* Resumen del pedido estilo Factura */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total a pagar</p>
                <h4 className="text-sm font-medium text-slate-900">Suscripción {plan.nombre} ({periodo})</h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">US${montoUsd}</span>
              </div>
            </div>
          </div>

          {/* Selector de Método de Pago */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Seleccioná tu método de pago</label>
            <div className="grid grid-cols-2 gap-4">
              
              <button
                type="button"
                onClick={() => setMetodoPago('tarjeta')}
                className={`relative border p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${
                  metodoPago === 'tarjeta' ? 'border-slate-800 bg-slate-50 shadow-[0_0_0_1px_#1e293b]' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex gap-2 items-center h-8">
                  {/* Visa logo (Texto Estilizado) */}
                  <div className="font-black italic tracking-tighter text-2xl text-[#1434CB] select-none h-6 flex items-center mb-0.5">
                    VISA
                  </div>
                  {/* Mastercard logo */}
                  <svg viewBox="0 0 50 30" className="h-6">
                    <circle fill="#EB001B" cx="15" cy="15" r="15"/>
                    <circle fill="#F79E1B" cx="35" cy="15" r="15"/>
                    <path fill="#FF5F00" d="M25 26.17c3.48-2.68 5.73-6.85 5.73-11.17S28.48 6.5 25 3.83A14.93 14.93 0 0019.27 15c0 4.32 2.25 8.49 5.73 11.17z"/>
                  </svg>
                </div>
                <span className={`text-sm font-semibold ${metodoPago === 'tarjeta' ? 'text-slate-900' : 'text-slate-600'}`}>Crédito / Débito</span>
                {metodoPago === 'tarjeta' && <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-900"></div>}
              </button>
              
              <button
                type="button"
                onClick={() => setMetodoPago('mercadopago')}
                className={`relative border p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${
                  metodoPago === 'mercadopago' ? 'border-[#009EE3] bg-[#009EE3]/5 shadow-[0_0_0_1px_#009EE3]' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center h-8">
                  {/* MercadoPago Logo Oficial (Mano a Mano) */}
                  <img 
                    src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.19.5/mercadopago/logo__small@2x.png" 
                    alt="Logo MP" 
                    className="h-8 w-auto object-contain" 
                  />
                  <span className="ml-1.5 font-black italic tracking-tighter text-lg text-[#009EE3] select-none">mercado<span className="text-slate-800">pago</span></span>
                </div>
                <span className={`text-sm font-semibold ${metodoPago === 'mercadopago' ? 'text-[#009EE3]' : 'text-slate-600'}`}>Dinero en cuenta</span>
                {metodoPago === 'mercadopago' && <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#009EE3]"></div>}
              </button>

            </div>
          </div>

          <div className="space-y-4">
            {/* Datos de Facturación */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Datos de Facturación
              </h4>
              
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre y Apellido o Razón Social</label>
                <input
                  type="text"
                  name="nombreFacturacion"
                  value={formData.nombreFacturacion}
                  onChange={handleInputChange}
                  placeholder="Ej. Juan Pérez / Empresa S.A."
                  className={`block w-full border ${errores.nombreFacturacion ? 'border-rose-500' : 'border-slate-300 focus:border-indigo-500'} rounded-lg py-2 px-3 text-sm focus:outline-none`}
                />
                {errores.nombreFacturacion && <p className="mt-1 text-[10px] text-rose-500 font-medium">Requerido para la factura.</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {formData.condicionIva === 'consumidor_final' ? 'DNI' : 'CUIT'}
                  </label>
                  <input
                    type="text"
                    name="cuit"
                    value={formData.cuit}
                    onChange={handleInputChange}
                    placeholder="Sin guiones ni puntos"
                    className={`block w-full border ${errores.cuit ? 'border-rose-500' : 'border-slate-300 focus:border-indigo-500'} rounded-lg py-2 px-3 text-sm focus:outline-none`}
                  />
                  {errores.cuit && <p className="mt-1 text-[10px] text-rose-500 font-medium">
                    {formData.condicionIva === 'consumidor_final' ? 'El DNI debe tener 7 u 8 números.' : 'El CUIT debe tener 11 números.'}
                  </p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condición Frente al IVA</label>
                  <select
                    name="condicionIva"
                    value={formData.condicionIva}
                    onChange={handleInputChange}
                    className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="consumidor_final">Consumidor Final</option>
                    <option value="monotributista">Monotributista</option>
                  </select>
                </div>
              </div>

              <div className="mb-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Domicilio de Facturación <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <input
                  type="text"
                  name="domicilio"
                  placeholder="Calle, Número, Ciudad, Provincia"
                  className="block w-full border border-slate-300 focus:border-indigo-500 rounded-lg py-2 px-3 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Datos Dinámicos según método */}
            {metodoPago === 'tarjeta' ? (
              <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Titular de la tarjeta</label>
                  <input
                    type="text"
                    name="nombreTarjeta"
                    value={formData.nombreTarjeta}
                    onChange={handleInputChange}
                    placeholder="Juan Pérez"
                    className={`block w-full border-b ${errores.nombreTarjeta ? 'border-rose-500' : 'border-slate-300 focus:border-slate-800'} py-2 px-1 focus:outline-none focus:ring-0 sm:text-sm bg-transparent font-medium`}
                  />
                  {errores.nombreTarjeta && <p className="mt-1 text-xs text-rose-500">Campo requerido.</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Número de tarjeta</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="numeroTarjeta"
                      value={formData.numeroTarjeta}
                      onChange={handleInputChange}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className={`block w-full border-b ${errores.numeroTarjeta ? 'border-rose-500' : 'border-slate-300 focus:border-slate-800'} py-2 px-1 focus:outline-none focus:ring-0 sm:text-sm font-mono tracking-widest bg-transparent`}
                    />
                  </div>
                  {errores.numeroTarjeta && <p className="mt-1 text-xs text-rose-500">Número inválido.</p>}
                </div>

                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vencimiento</label>
                    <input
                      type="text"
                      name="vencimiento"
                      value={formData.vencimiento}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      maxLength={5}
                      className={`block w-full border-b ${errores.vencimiento ? 'border-rose-500' : 'border-slate-300 focus:border-slate-800'} py-2 px-1 focus:outline-none focus:ring-0 sm:text-sm font-mono bg-transparent`}
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                      className={`block w-full border-b ${errores.cvv ? 'border-rose-500' : 'border-slate-300 focus:border-slate-800'} py-2 px-1 focus:outline-none focus:ring-0 sm:text-sm font-mono bg-transparent`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-[#009EE3]/30 bg-[#009EE3]/5 p-5 rounded-xl shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#009EE3]"></div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Alias / CBU de tu cuenta MP</label>
                  <input
                    type="text"
                    name="mpAlias"
                    value={formData.mpAlias}
                    onChange={handleInputChange}
                    placeholder="juan.perez.mp"
                    className={`block w-full border-b ${errores.mpAlias ? 'border-rose-500' : 'border-slate-300 focus:border-[#009EE3]'} py-2 px-1 focus:outline-none focus:ring-0 sm:text-sm bg-transparent font-medium`}
                  />
                  {errores.mpAlias && <p className="mt-1 text-xs text-rose-500">Campo requerido.</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Email asociado a MercadoPago</label>
                  <input
                    type="email"
                    name="mpEmail"
                    value={formData.mpEmail}
                    onChange={handleInputChange}
                    placeholder="juan@ejemplo.com"
                    className={`block w-full border-b ${errores.mpEmail ? 'border-rose-500' : 'border-slate-300 focus:border-[#009EE3]'} py-2 px-1 focus:outline-none focus:ring-0 sm:text-sm bg-transparent`}
                  />
                  {errores.mpEmail && <p className="mt-1 text-xs text-rose-500">Email inválido.</p>}
                </div>
              </div>
            )}
          </div>

          {mensajeError && (
            <div className="mt-6 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {mensajeError}
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={procesando}
              className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white transition-all
                ${procesando ? 'opacity-70 cursor-not-allowed bg-slate-500' : 
                  metodoPago === 'mercadopago' ? 'bg-[#009EE3] hover:bg-[#0081B8]' : 'bg-slate-900 hover:bg-slate-800'
                }`}
            >
              {procesando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <svg className="w-5 h-5 mr-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              )}
              {procesando ? 'Procesando pago seguro...' : `Pagar US$${montoUsd} de forma segura`}
            </button>
            <p className="mt-4 text-center text-xs text-slate-400 font-medium px-4">
              <span className="flex items-center justify-center gap-1 mb-1">
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Renovación automática {periodo}. Cancelá en cualquier momento.
              </span>
              Pagos procesados de forma segura con encriptación AES-256.
            </p>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
