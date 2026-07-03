/**
 * @fileoverview Pantalla de inicio de sesión de usuarios
 */

import React, { useState } from 'react';

/**
 * Componente que renderiza el formulario de inicio de sesión.
 * Permite a los usuarios autenticarse ingresando su email y contraseña.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {(userName: string) => void} props.onLoginSuccess - Función que se ejecuta cuando el login es exitoso, recibe el nombre del usuario
 * @param {() => void} props.onGoToRegister - Función para navegar a la pantalla de registro
 * @returns {JSX.Element}
 */

function Login({ onLoginSuccess, onGoToRegister }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [emptyFields, setEmptyFields] = useState([]);

  const autenticar = async (e) => {
    e.preventDefault();

    const empty = [];
    if (user.trim() === '') empty.push('user');
    if (pass.trim() === '') empty.push('pass');

    if (empty.length > 0) {
      setEmptyFields(empty);
      setErrorMsg('Todos los campos son obligatorios');
      return;
    }

    setEmptyFields([]);

    setErrorMsg('');

    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
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
        localStorage.setItem('userName', data.data.usuario.name);
        onLoginSuccess(data.data.usuario.name);
      } else {
        setErrorMsg(data.message || 'No coinciden usuario y contraseña');
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrorMsg('Error de conexión con el servidor');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm w-full max-w-md p-8">
        <div className="flex flex-col space-y-2 text-center mb-8">
          <div className="text-2xl font-semibold tracking-tight">Bienvenido de nuevo</div>
          <p className="text-sm text-slate-500">Ingresá tus credenciales para acceder</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="user" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
            <input
              type="email" id="user" value={user}
              onChange={(e) => {
                setUser(e.target.value);
                if (e.target.value.trim() !== '') setEmptyFields(prev => prev.filter(f => f !== 'user'));
              }}
              className={`flex h-9 w-full rounded-md border ${emptyFields.includes('user') ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-slate-950'} bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1`}
              placeholder="m@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Contraseña</label>
            <input
              type="password" id="password" value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                if (e.target.value.trim() !== '') setEmptyFields(prev => prev.filter(f => f !== 'pass'));
              }}
              className={`flex h-9 w-full rounded-md border ${emptyFields.includes('pass') ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-slate-950'} bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1`}
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={(e) => autenticar(e)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-4 py-2 w-full shadow"
            >
              Ingresar
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onGoToRegister}
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;