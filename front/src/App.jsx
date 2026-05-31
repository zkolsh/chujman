import React, { useState, useEffect } from 'react';
import Inicio from './Inicio';
import Login from './Login';
import Register from './Register';
import Receta from './Receta';
import PanelProyectos from './PanelProyectos';
import TableroProyecto from './TableroProyecto';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('inicio');
  const [activeProject, setActiveProject] = useState(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

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
          handleLogout(); // Token inválido
        }
      })
      .catch(() => {
        // Si hay error de red, asumimos que está logueado temporalmente si hay token
        setIsLoggedIn(true); 
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setActiveProject(null);
    setIsLoggedIn(false);
    setAuthView('inicio');
    setShowEasterEgg(false);
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