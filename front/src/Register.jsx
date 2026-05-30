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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
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
        <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
            <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm w-full max-w-md p-8">
                <div className="flex flex-col space-y-2 text-center mb-8">
                    <div className="text-2xl font-semibold tracking-tight">Crear Cuenta</div>
                    <p className="text-sm text-slate-500">Ingresá tus datos para registrarte</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center font-medium">
                        {errorMsg}
                    </div>
                )}

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nombre</label>
                        <input
                            type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                            placeholder="Juan Pérez"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="user" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                        <input
                            type="email" id="user" value={user} onChange={(e) => setUser(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                            placeholder="m@ejemplo.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Contraseña</label>
                        <input
                            type="password" id="password" value={pass} onChange={(e) => setPass(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={registrar}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-4 py-2 w-full shadow"
                        >
                            Registrarme
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={onGoToLogin}
                        className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
                    >
                        ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;