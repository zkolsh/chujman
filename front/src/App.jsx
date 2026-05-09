import React, { useState, useEffect } from 'react';
import Inicio from './Inicio';
import Login from './Login';
import Register from './Register';
import Receta from './Receta';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Arrancamos mostrando la pantalla de inicio
  const [authView, setAuthView] = useState('inicio');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setAuthView('inicio'); // Al cerrar sesión, lo mandamos al inicio de vuelta
  };

  return (
    <div>
      {isLoggedIn ? (
        <Receta onLogout={handleLogout} />
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