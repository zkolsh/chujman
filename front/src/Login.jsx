import React, { useState } from 'react';

function Login({ onLoginSuccess, onGoToRegister }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const autenticar = async (e) => {
    e.preventDefault();

    if (user.trim() === '' || pass.trim() === '') {
      setErrorMsg('usuario o password vacio');
      return;
    }

    if (pass.length <= 3) {
      setErrorMsg('password demasiado corto');
      return;
    }

    setErrorMsg('');

    try {

      const response = await fetch('http://localhost:55500/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gmail: user,
          password: pass
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.data.token);
        onLoginSuccess();
      } else {
        setErrorMsg(data.message || 'No coinciden usuario y contraseña');
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrorMsg('Error de conexión con el servidor');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Bienvenido de nuevo</h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md text-center">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text" id="user" value={user}
              onChange={(e) => setUser(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password" id="password" value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              onClick={(e) => autenticar(e)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-150">
              Ingresar
            </button>
          </div>
        </form>

        {/* Botoncito extra para ir al nuevo Register.jsx */}
        <div className="mt-4 text-center">
          <button
            onClick={onGoToRegister}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ¿No tienes cuenta? Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;