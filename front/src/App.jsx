import React, { useState, useEffect } from 'react';
import Inicio from './Inicio';
import Login from './Login';
import Register from './Register';
import Receta from './Receta';
import PanelProyectos from './PanelProyectos';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Arrancamos mostrando la pantalla de inicio
  const [authView, setAuthView] = useState('inicio');
  const [activeProjectId, setActiveProjectId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setActiveProjectId(null);
    setIsLoggedIn(false);
    setAuthView('inicio'); // Al cerrar sesión, lo mandamos al inicio de vuelta
  };

  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    navigateTo(`project/${projectId}`);
  };

  const handleLeaveProject = () => {
    setActiveProjectId(null);
    navigateTo('dashboard');
  };

  return (
    <div>
      {isLoggedIn ? (
        activeProjectId ? (
          <Receta 
            projectId={activeProjectId} 
            onBackToDashboard={handleLeaveProject}
            onLogout={handleLogout} 
          />
        ) : (
          <PanelProyectos 
            onSelectProject={handleSelectProject} 
            onLogout={handleLogout} 
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
          // Opcional: podrías pasar un onGoToInicio={() => setAuthView('inicio')} a Login si querés un botón de "Volver"
          />
        ) : (
          <Register
            onRegisterSuccess={() => setIsLoggedIn(true)}
            onGoToLogin={() => setAuthView('login')}
          />
        )
      )}
    </div>
  );
}

export default App;