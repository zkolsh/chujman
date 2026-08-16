/**
 * @fileoverview Componente para visualizar y permitir la impresión nativa de una Factura (Estilo AFIP).
 */

import React, { useState, useEffect } from 'react';

/**
 * Componente que renderiza una factura en formato PDF (imprimible).
 * Detecta automáticamente si el usuario requiere Factura A o Factura B.
 * La Factura A desglosa el IVA (21%) mientras que la Factura B lo incluye en el monto total.
 * 
 * @param {Object} props
 * @param {Object} props.facturaId - ID de la factura a consultar y mostrar
 * @param {Function} props.onBack - Callback para volver a la vista anterior
 * @returns {JSX.Element}
 */
const FacturaPrint = ({ facturaId, onBack }) => {
  const [factura, setFactura] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [facturaId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Factura
      const resFactura = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/me/facturas/${facturaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataFactura = await resFactura.json();
      
      // Fetch User para el nombre
      const resUser = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataUser = await resUser.json();

      if (dataFactura.success) setFactura(dataFactura.data);
      if (dataUser.success) setUser(dataUser.data);
      
    } catch (error) {
      console.error("Error cargando factura o usuario", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Cargando Factura...</div>;
  if (!factura) return <div className="p-8 text-center text-red-500 font-bold">Factura no encontrada</div>;

  const tipo = factura.tipo || 'B';
  const nombreCliente = factura.nombreFacturacion || (user?.name ? user.name : 'Consumidor Final');
  const codigoComprobante = tipo === 'A' ? '001' : (tipo === 'B' ? '006' : '011');
  
  // AFIP uses a central box with the letter
  return (
    <div className="bg-slate-200 min-h-screen py-8 print:bg-white print:py-0 text-[13px] font-sans text-black">
      
      {/* Controles (ocultos al imprimir) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between print:hidden px-4">
        <button onClick={onBack} className="px-4 py-2 bg-white border border-slate-300 rounded shadow-sm text-slate-700 hover:bg-slate-50 font-medium">
          &larr; Volver
        </button>
        <button onClick={handlePrint} className="px-6 py-2 bg-slate-900 text-white font-bold rounded shadow hover:bg-slate-800 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Imprimir / PDF
        </button>
      </div>

      {/* Papel de la Factura (tamaño A4 simulado) */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-10 border border-slate-300 shadow-xl print:shadow-none print:border-none print:w-full print:max-w-none print:p-0 print:min-h-0">
        
        {/* ENCABEZADO AFIP ESTILO */}
        <div className="border border-black relative mb-4">
          
          {/* Caja Central de Letra */}
          <div className="absolute left-1/2 -ml-[25px] top-0 w-[50px] h-[50px] border-x border-b border-black bg-white flex flex-col items-center justify-center pt-1">
            <span className="text-[32px] font-black leading-none">{tipo}</span>
            <span className="text-[9px] font-bold mt-1">COD. {codigoComprobante}</span>
          </div>

          <div className="flex justify-between items-start pt-2 px-4 pb-4">
            
            {/* Lado Izquierdo - Empresa */}
            <div className="w-[45%]">
              <h1 className="text-2xl font-black mb-3">Schujvider Asociación</h1>
              <p className="font-semibold mb-1">Razón Social: <span className="font-normal">Schujvider Asociación S.A.</span></p>
              <p className="font-semibold mb-1">Domicilio Comercial: <span className="font-normal">Ayacucho 1667, Rosario, Santa Fe</span></p>
              <p className="font-semibold">Condición frente al IVA: <span className="font-bold">Responsable Inscripto</span></p>
            </div>
            
            {/* Lado Derecho - Comprobante */}
            <div className="w-[45%] text-right pl-4">
              <h2 className="text-2xl font-black mb-3 mr-4">FACTURA</h2>
              <div className="text-left ml-auto w-fit">
                <p className="font-bold text-sm mb-1">Comp. Nro: <span className="font-normal">00001-{factura.id.toString().padStart(8, '0')}</span></p>
                <p className="font-bold text-sm mb-3">Fecha de Emisión: <span className="font-normal">{new Date(factura.createdAt).toLocaleDateString('es-AR')}</span></p>
                <p className="font-semibold mb-0.5">CUIT: <span className="font-normal">30-12345678-9</span></p>
                <p className="font-semibold mb-0.5">Ingresos Brutos: <span className="font-normal">901-123456-1</span></p>
                <p className="font-semibold">Inicio de Actividades: <span className="font-normal">05/04/2026</span></p>
              </div>
            </div>

          </div>
        </div>

        {/* DATOS DEL CLIENTE RECEPTOR */}
        <div className="border border-black p-3 mb-4">
          <div className="flex mb-2">
            <p className="w-1/2 font-bold">CUIT/DNI: <span className="font-normal">{factura.cuit || 'Consumidor Final'}</span></p>
            <p className="w-1/2 font-bold">Apellido y Nombre / Razón Social: <span className="font-normal">{nombreCliente}</span></p>
          </div>
          <div className="flex">
            <p className="w-1/2 font-bold">Condición frente al IVA: <span className="font-normal">{factura.cuit?.length === 11 ? 'Monotributista' : 'Consumidor Final'}</span></p>
            <p className="w-1/2 font-bold">Condición de Venta: <span className="font-normal">Tarjeta de Crédito/Débito</span></p>
          </div>
        </div>

        {/* TABLA DE ÍTEMS */}
        <div className="border border-black mb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-200 border-b border-black text-[11px] uppercase">
                <th className="p-2 border-r border-black w-20">Código</th>
                <th className="p-2 border-r border-black">Producto / Servicio</th>
                <th className="p-2 border-r border-black w-16 text-center">Cant.</th>
                <th className="p-2 border-r border-black w-16 text-center">U. Med.</th>
                <th className="p-2 border-r border-black w-24 text-right">Precio Unit.</th>
                <th className="p-2 border-r border-black w-16 text-center">% Bonif</th>
                <th className="p-2 border-r border-black w-24 text-right">Subtotal</th>
                {tipo === 'A' && <th className="p-2 border-r border-black w-20 text-center">Alícuota IVA</th>}
                {tipo === 'A' && <th className="p-2 w-28 text-right">Subtotal c/IVA</th>}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black/20 align-top">
                <td className="p-2 border-r border-black">SUB-01</td>
                <td className="p-2 border-r border-black">Licencia de Software (Plataforma)</td>
                <td className="p-2 border-r border-black text-center">1.00</td>
                <td className="p-2 border-r border-black text-center">unidades</td>
                <td className="p-2 border-r border-black text-right">{tipo === 'A' ? factura.montoNeto.toLocaleString('es-AR', {minimumFractionDigits: 2}) : factura.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
                <td className="p-2 border-r border-black text-center">0.00</td>
                <td className="p-2 border-r border-black text-right">{tipo === 'A' ? factura.montoNeto.toLocaleString('es-AR', {minimumFractionDigits: 2}) : factura.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
                {tipo === 'A' && <td className="p-2 border-r border-black text-center">21%</td>}
                {tipo === 'A' && <td className="p-2 text-right font-semibold">{factura.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>}
              </tr>
              {/* Filas vacías para rellenar */}
              <tr className="h-40"><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td>{tipo === 'A' && <td className="border-r border-black"></td>}{tipo === 'A' && <td></td>}</tr>
            </tbody>
          </table>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end mb-16">
          <div className="w-72 border border-black p-3 bg-slate-50">
            <div className="flex justify-between font-bold mb-1">
              <span>{tipo === 'A' ? 'Importe Neto Gravado: $' : 'Subtotal: $'}</span>
              <span>{tipo === 'A' ? factura.montoNeto.toLocaleString('es-AR', {minimumFractionDigits: 2}) : factura.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
            </div>
            {tipo === 'A' && (
              <div className="flex justify-between font-bold mb-1">
                <span>IVA 21%: $</span>
                <span>{factura.iva.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-lg border-t border-black pt-2 mt-2">
              <span>Importe Total: $</span>
              <span>{factura.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        {/* PIE DE PÁGINA AFIP (CAE y QR Simulado) */}
        <div className="flex justify-between items-end border-t border-black pt-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border-4 border-black p-1 bg-white relative">
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMCAwdjEwaDEwVjBIMHptMjAgMHYxMGgxMFYwSDIwem0yMCAwdjEwaDEwVjBINDB6TTAgMjB2MTBoMTBWMjBIMHptMjAgMHYxMGgxMFYyMEgyMHptMjAgMHYxMGgxMFYyMEg0MHpNNSAxNXY1aDV2LTVINXptMjAgMHY1aDV2LTVIMjV6TTAgNDB2MTBoMTBWNDBIMHptMjAgMHYxMGgxMFY0MEgyMHptMjAgMHYxMGgxMFY0MEg0MHpNNSAzNXY1aDV2LTVINXptMjAgMHY1aDV2LTVIMjV6IiBmaWxsPSIjMDAwIi8+PC9zdmc+')] bg-repeat"></div>
            </div>
            <div className="text-[20px] font-black italic tracking-tighter leading-none">
              ARCA
              <span className="block text-[10px] font-normal not-italic tracking-normal">Comprobante Autorizado</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm mb-1">CAE N°: <span className="font-normal">73123456789012</span></p>
            <p className="font-bold text-sm">Fecha de Vto. de CAE: <span className="font-normal">{new Date(new Date(factura.createdAt).getTime() + 10*24*60*60*1000).toLocaleDateString('es-AR')}</span></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacturaPrint;
