import React,{ useState } from 'react';

function Login({ onLoginSuccess }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const autenticar = async (e) => {
    e.preventDefault();

    if (user.trim() === '' || pass.trim() === '') {
      setErrorMsg('usuario o password vacio');
      return { success: false, message: 'usuario o password vacio' };
    }

    if (pass.length <= 3) {
      setErrorMsg('password demasiado corto');
      return { success: false, message: 'password demasiado corto' };
    }

    setErrorMsg('');

    try {
      const response = await fetch('/api/auth_login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username: user, 
          password: pass 
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        setErrorMsg('No coinciden usuario y contraseña');
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      

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
            <label htmlFor="user" className="block text-sm font-medium text-gray-700">Usuario</label>
            <input 
              type="text" 
              id="user" 
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900"> Recordarme </label>
            </div>
          </div>

          <div>
            <button 
              onClick={(e) => autenticar(e)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;