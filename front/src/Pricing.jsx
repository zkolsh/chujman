/**
 * @fileoverview Componente que muestra los planes de precios disponibles y permite iniciar el proceso de checkout.
 */

import React, { useState, useEffect } from 'react';
import CheckoutModal from './CheckoutModal';
import ConfirmModal from './ConfirmModal';

/**
 * Componente de Precios (Pricing)
 * Permite alternar entre precios mensuales y anuales, y seleccionar un plan.
 * 
 * @param {Object} props
 * @param {Function} props.onBack - Callback para volver al panel/perfil
 * @param {Function} props.onCheckoutSuccess - Callback que se ejecuta cuando el pago es exitoso
 * @returns {JSX.Element}
 */
const Pricing = ({ onBack, onCheckoutSuccess }) => {
  const [esAnual, setEsAnual] = useState(false);
  const [userPlan, setUserPlan] = useState(null);
  const [userPeriod, setUserPeriod] = useState('mensual');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [downgradeTarget, setDowngradeTarget] = useState(null);
  
  // Modal de éxito/error genérico
  const [resultModal, setResultModal] = useState({ isOpen: false, title: '', message: '', isDanger: false });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUserPlan(data.data.nivelSuscripcion || 'Gratis');
        setUserPeriod(data.data.periodoSuscripcion || 'mensual');
      }
    } catch (error) {
      console.error("Error cargando perfil", error);
    }
  };

  const getPlanWeight = (planName) => {
    const weights = { 'Gratis': 0, 'Advanced': 10, 'Pro': 20, 'Unlimited': 60 };
    return weights[planName] || 0;
  };

  const handleSelectPlan = (planNombre, esAnual, precio) => {
    if (planNombre === 'Gratis' && userPlan === 'Gratis') return; // No hacer nada si ya es gratis

    // Si elige gratis y ya tiene premium (cancelación total)
    if (planNombre === 'Gratis') {
      setShowCancelModal(true);
      return;
    }

    const currentWeight = getPlanWeight(userPlan);
    const targetWeight = getPlanWeight(planNombre);

    // Si es un downgrade a un plan de pago inferior
    if (targetWeight < currentWeight) {
      setDowngradeTarget(planNombre);
      setShowDowngradeModal(true);
      return;
    }

    setSelectedPlanInfo({
      nombre: planNombre,
      precioMensual: esAnual ? precio : precio,
      precioAnual: precio
    });
    setModalOpen(true);
  };

  const executeCancelSubscription = () => {
    setShowCancelModal(false);
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL}/subscriptions/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      setResultModal({
        isOpen: true,
        title: data.success ? 'Suscripción Cancelada' : 'Error',
        message: data.message || 'Error al cancelar',
        isDanger: !data.success
      });
      fetchProfile(); // Recargar el estado
    }).catch(err => {
      console.error("Error cancelando suscripción", err);
      setResultModal({
        isOpen: true,
        title: 'Error de Conexión',
        message: 'Ocurrió un error al procesar tu solicitud.',
        isDanger: true
      });
    });
  };

  const executeDowngrade = () => {
    setShowDowngradeModal(false);
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL}/subscriptions/downgrade`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nextPlan: downgradeTarget })
    }).then(res => res.json()).then(data => {
      setResultModal({
        isOpen: true,
        title: data.success ? 'Cambio Programado' : 'Error',
        message: data.message || 'Error al programar cambio',
        isDanger: !data.success
      });
      fetchProfile(); // Recargar el estado
    }).catch(err => {
      console.error("Error programando downgrade", err);
      setResultModal({
        isOpen: true,
        title: 'Error de Conexión',
        message: 'Ocurrió un error al procesar tu solicitud.',
        isDanger: true
      });
    });
  };

  const planes = [
    {
      nombre: 'Gratis',
      descripcion: 'Para probar la plataforma',
      precioMensual: 0,
      precioAnual: 0,
      limiteProyectos: 3,
      caracteristicas: ['Hasta 3 proyectos', 'Soporte comunitario', 'Funciones básicas']
    },
    {
      nombre: 'Advanced',
      descripcion: 'Para profesionales independientes',
      precioMensual: 10,
      precioAnual: 100,
      limiteProyectos: 10,
      caracteristicas: ['Hasta 10 proyectos', 'Soporte por email', 'Color de portada personalizado', '2 meses gratis en plan anual']
    },
    {
      nombre: 'Pro',
      descripcion: 'Para usuarios intensivos',
      precioMensual: 20,
      precioAnual: 200,
      limiteProyectos: 15,
      caracteristicas: ['Hasta 15 proyectos', 'Soporte prioritario', 'Mayor velocidad de procesamiento', '2 meses gratis en plan anual']
    },
    {
      nombre: 'Unlimited',
      descripcion: 'Sin límites para empresas',
      precioMensual: 60,
      precioAnual: 600,
      limiteProyectos: 'Ilimitados',
      caracteristicas: ['Proyectos ilimitados', 'Soporte 24/7', 'Gestor de cuenta', '2 meses gratis en plan anual']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">

      {/* Navbar Minimalista */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="text-sm font-medium text-slate-500 tracking-tight">Planes y Suscripciones</div>
        <button
          onClick={onBack}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver atrás
        </button>
      </nav>

      {/* Header Section (Oscuro y sobrio) */}
      <div className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-base font-semibold text-indigo-400 tracking-wide uppercase">Precios</h2>
          <p className="mt-2 text-3xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-4xl">
            Precios simples, sin sorpresas
          </p>
          <p className="max-w-xl mt-5 mx-auto text-lg text-slate-400">
            Encontrá el plan que mejor se adapte a tus necesidades. Podés actualizar o cancelar tu suscripción en cualquier momento.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Toggle Mensual / Anual */}
        <div className="mt-10 mb-10 flex justify-center items-center space-x-4">
          <span className={`text-sm font-medium ${!esAnual ? 'text-slate-900' : 'text-slate-500'}`}>Mensual</span>
          <button
            onClick={() => setEsAnual(!esAnual)}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${esAnual ? 'bg-indigo-600' : 'bg-slate-300'}`}
            role="switch"
            aria-checked={esAnual}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${esAnual ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
          <span className={`text-sm font-medium ${esAnual ? 'text-slate-900' : 'text-slate-500'}`}>
            Anual <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">-16% dto.</span>
          </span>
        </div>

        {/* Tarjetas de Precios */}
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {planes.map((plan) => {
            const isPro = plan.nombre === 'Pro';

            return (
              <div
                key={plan.nombre}
                className={`relative flex flex-col bg-white rounded-2xl p-8 transition-all duration-200
                  ${isPro
                    ? 'border-2 border-indigo-600 shadow-xl shadow-indigo-100/50 scale-100 lg:scale-105 z-10'
                    : 'border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
              >
                {isPro && (
                  <div className="absolute top-0 inset-x-0 flex justify-center -mt-3">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-sm">
                      MÁS POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">{plan.nombre}</h3>
                  <p className="mt-2 text-sm text-slate-500 h-10">{plan.descripcion}</p>
                </div>

                <div className="my-6 flex items-baseline">
                  <span className="text-2xl font-semibold text-slate-400 mr-1">US$</span>
                  <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                    {esAnual ? plan.precioAnual : plan.precioMensual}
                  </span>
                  <span className="ml-1 text-lg font-medium text-slate-500">
                    /{esAnual ? 'año' : 'mes'}
                  </span>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.nombre, esAnual, esAnual ? plan.precioAnual : plan.precioMensual)}
                  disabled={plan.nombre === 'Gratis' && userPlan === 'Gratis'}
                  className={`mt-4 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all
                    ${(plan.nombre === 'Gratis' && userPlan === 'Gratis')
                      ? 'bg-emerald-100 text-emerald-800 border-none cursor-default'
                      : plan.nombre === userPlan
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200'
                        : isPro
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                          : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                >
                  {(plan.nombre === 'Gratis' && userPlan === 'Gratis') || (plan.nombre === userPlan && esAnual === (userPeriod === 'anual')) 
                    ? 'Plan Actual' 
                    : plan.nombre === userPlan 
                      ? (esAnual ? 'Pasar a Anual' : 'Pasar a Mensual') 
                      : plan.precioMensual === 0 
                        ? 'Cancelar a Gratis' 
                        : `Elegir ${plan.nombre}`}
                </button>

                {/* Lista de características */}
                <ul className="mt-8 space-y-4 flex-1">
                  {plan.caracteristicas.map((caracteristica, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-slate-600 font-medium">{caracteristica}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Sección de confianza (Opcional visual) */}
        <div className="mt-16 border-t border-slate-200 pt-10 text-center">
          <p className="text-sm text-slate-500">
            Todos los pagos son procesados de forma segura mediante encriptación SSL.
            <br className="hidden sm:block" /> No almacenamos los datos de tu tarjeta de crédito en nuestros servidores.
          </p>
        </div>

      </div>

      {/* Modal de Checkout */}
      {modalOpen && selectedPlanInfo && (
        <CheckoutModal
          plan={selectedPlanInfo}
          periodo={esAnual ? 'anual' : 'mensual'}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            if (onCheckoutSuccess) onCheckoutSuccess();
          }}
        />
      )}

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancelar Renovación"
        message="Al cancelar, mantendrás tus beneficios premium hasta el final de tu período actual y luego pasarás al plan Gratis. ¿Estás seguro de que querés cancelar la renovación automática?"
        confirmText="Sí, cancelar suscripción"
        cancelText="Volver atrás"
        onConfirm={executeCancelSubscription}
        onCancel={() => setShowCancelModal(false)}
        isDanger={true}
      />

      <ConfirmModal
        isOpen={showDowngradeModal}
        title="Programar Cambio de Plan"
        message={`¿Estás seguro de que deseas cambiar al plan ${downgradeTarget}? Mantendrás tus beneficios actuales de ${userPlan} hasta el final de tu ciclo de facturación. En el próximo ciclo, se te cobrará el plan ${downgradeTarget}.`}
        confirmText={`Sí, programar cambio a ${downgradeTarget}`}
        cancelText="Volver atrás"
        onConfirm={executeDowngrade}
        onCancel={() => setShowDowngradeModal(false)}
        isDanger={false}
      />

      <ConfirmModal
        isOpen={resultModal.isOpen}
        title={resultModal.title}
        message={resultModal.message}
        confirmText="Aceptar"
        onConfirm={() => setResultModal({ ...resultModal, isOpen: false })}
        hideCancel={true}
        isDanger={resultModal.isDanger}
      />
    </div>
  );
};

export default Pricing;

