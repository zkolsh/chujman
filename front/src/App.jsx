/**
 * @fileoverview Componente principal de la aplicación, maneja las rutas y el estado de autenticación.
 */

import React, { useState, useEffect } from 'react';
import Inicio from './Inicio';
import Login from './Login';
import Register from './Register';
import Receta from './Receta';
import PanelProyectos from './PanelProyectos';
import TableroProyecto from './TableroProyecto';
import ConfirmModal from './ConfirmModal';
import Perfil from './Perfil';
import Pricing from './Pricing';
import FacturaPrint from './FacturaPrint';

/**
 * Componente raíz de la aplicación.
 * Controla el flujo entre inicio de sesión, registro, panel de proyectos y la vista del proyecto.
 * 
 * @returns {JSX.Element}
 */

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('inicio');
  const [activeProject, setActiveProject] = useState(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [mainView, setMainView] = useState('dashboard'); // dashboard, profile, pricing, factura
  const [facturaId, setFacturaId] = useState(null);

  // ConfirmModal state for Logout
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, message: '', onConfirm: null });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validar token y obtener datos del usuario
      fetch(`${import.meta.env.VITE_API_URL}/auth/validateToken`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            localStorage.setItem('userName', data.user.name || '');
            setIsLoggedIn(true);
          } else {
            executeLogout(); // Token inválido
          }
        })
        .catch(() => {
          // Si hay error de red, asumimos que está logueado temporalmente si hay token
          setIsLoggedIn(true);
        });
    }
  }, []);

  const executeLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setActiveProject(null);
    setIsLoggedIn(false);
    setAuthView('inicio');
    setShowEasterEgg(false);
    setMainView('dashboard');
    setConfirmConfig({ ...confirmConfig, isOpen: false });
  };

  const handleLogout = (force) => {
    if (force !== true) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cerrar Sesión',
        message: '¿Estás seguro que deseas cerrar sesión?',
        confirmText: 'Cerrar sesión',
        isDanger: true,
        onConfirm: executeLogout
      });
      return;
    }
    executeLogout();
  };

  const handleSelectProject = (project) => {
    setActiveProject(project);
    setShowEasterEgg(false);
  };

  const handleLeaveProject = () => {
    setActiveProject(null);
    setShowEasterEgg(false);
  };

  if (showEasterEgg) {
    return <Receta onLogout={() => setShowEasterEgg(false)} />;
  }

  return (
    <>
      <div>
        {isLoggedIn ? (
          activeProject ? (
            <TableroProyecto
              project={activeProject}
              onSelectProject={handleSelectProject}
              onBackToDashboard={handleLeaveProject}
              onLogout={handleLogout}
              onEasterEgg={() => setShowEasterEgg(true)}
            />
          ) : mainView === 'profile' ? (
            <Perfil 
              onBack={() => setMainView('dashboard')}
              onUpgrade={() => setMainView('pricing')}
              onPrintInvoice={(id) => { setFacturaId(id); setMainView('factura'); }}
            />
          ) : mainView === 'pricing' ? (
            <Pricing 
              onBack={() => setMainView('profile')}
              onCheckoutSuccess={() => setMainView('profile')}
            />
          ) : mainView === 'factura' ? (
            <FacturaPrint 
              facturaId={facturaId}
              onBack={() => setMainView('profile')}
            />
          ) : (
            <PanelProyectos
              onSelectProject={handleSelectProject}
              onLogout={handleLogout}
              onGoToProfile={() => setMainView('profile')}
              onUpgrade={() => setMainView('pricing')}
            />
          )
        ) : (
          authView === 'inicio' ? (
            <Inicio
              onGoToLogin={() => setAuthView('login')}
              onGoToRegister={() => setAuthView('register')}
            />
          ) : authView === 'login' ? (
            <Login
              onLoginSuccess={() => setIsLoggedIn(true)}
              onGoToRegister={() => setAuthView('register')}
            />
          ) : (
            <Register
              onRegisterSuccess={() => setIsLoggedIn(true)}
              onGoToLogin={() => setAuthView('login')}
            />
          )
        )}
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        isDanger={confirmConfig.isDanger}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </>
  );
}

export default App;