import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import Receta from './Receta';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setAuthView('login');
  };

  return (
    <div>

      {isLoggedIn ? (
        <Receta onLogout={handleLogout} />
      ) : (
        authView === 'login' ? (
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