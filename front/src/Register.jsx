import React, { useState } from 'react';

function Register({ onRegisterSuccess, onGoToLogin }) {
    const [name, setName] = useState('');
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const registrar = async (e) => {
        e.preventDefault();

        if (name.trim() === '' || user.trim() === '' || pass.trim() === '') {
            setErrorMsg('Todos los campos son obligatorios');
            return;
        }

        if (pass.length <= 3) {
            setErrorMsg('La contraseña es demasiado corta');
            return;
        }

        setErrorMsg('');

        try {
            const response = await fetch('http://localhost:55500/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, gmail: user, password: pass })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('token', data.data.token);
                onRegisterSuccess();
            } else {
                setErrorMsg(data.message || 'Error al registrar el usuario');
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            setErrorMsg('Error al conectar con el servidor');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear Cuenta</h2>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md text-center">
                        {errorMsg}
                    </div>
                )}

                <form className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="user" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email" id="user" value={user} onChange={(e) => setUser(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password" id="password" value={pass} onChange={(e) => setPass(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <button
                            onClick={registrar}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition duration-150">
                            Registrarme
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={onGoToLogin}
                        className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                    >
                        ¿Ya tienes cuenta? Inicia sesión aquí
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;