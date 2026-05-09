import React from 'react';

const Inicio = ({ onGoToLogin, onGoToRegister }) => {
    return (
        <div
            className="min-h-screen font-sans bg-cover bg-center bg-no-repeat relative flex flex-col"
            style={{ backgroundImage: "url('/fondoInicio.png')" }}
        >
            <div className="absolute inset-0 bg-slate-900/80 z-0"></div>

            <div className="relative z-10 flex flex-col flex-grow">
                <header className="flex justify-between items-center py-5 px-8">
                    <div className="text-2xl font-black text-white tracking-tight">
                        SchujVider
                    </div>

                    <div className="flex gap-4 items-center">
                        <button
                            onClick={onGoToLogin}
                            className="text-slate-300 font-semibold hover:text-white transition-colors"
                        >
                            Log in
                        </button>
                        <button
                            onClick={onGoToRegister}
                            className="bg-emerald-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-colors"
                        >
                            Register
                        </button>
                    </div>
                </header>

                <main className="flex-grow flex flex-col items-center justify-center text-center px-6 pb-20">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-200 max-w-4xl leading-tight mb-6 drop-shadow-md">
                        Organizá tus proyectos y <span className="text-indigo-400">dividí el trabajo</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 drop-shadow-sm">
                        La plataforma pensada para divdir el trabajo. Creá tus listas de tareas, desglosá los problemas grandes en partes más pequeñas y asignáselas a tus compañeros fácilmente.
                    </p>

                    <button
                        onClick={onGoToRegister}
                        className="bg-white text-slate-900 font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:bg-slate-200 transition-transform transform hover:-translate-y-1"
                    >
                        Crear mi primer tablero
                    </button>

                    <div className="mt-16 w-full max-w-3xl bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-left">
                        <div className="flex items-center gap-3 border-b border-slate-600 pb-4">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        </div>
                        <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-emerald-400">Tarea Principal: Armar el Backend</h3>
                            <div className="mt-3 pl-4 border-l-2 border-slate-600 flex flex-col gap-2">
                                <div className="bg-slate-800 p-2 rounded text-sm text-slate-300">↳ Subtarea 1: Configurar base de datos</div>
                                <div className="bg-slate-800 p-2 rounded text-sm text-slate-300">↳ Subtarea 2: Crear endpoints JWT</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Inicio;