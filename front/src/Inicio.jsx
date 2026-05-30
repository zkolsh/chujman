import React from 'react';

const Inicio = ({ onGoToLogin, onGoToRegister }) => {
    return (
        <div className="min-h-screen font-sans relative flex flex-col overflow-hidden">
            <div 
                className="absolute inset-0 bg-center bg-no-repeat scale-[1.3]"
                style={{ backgroundImage: "url('/fondoInicio.png')", backgroundSize: 'cover' }}
            ></div>
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-0"></div>

            <div className="relative z-10 flex flex-col flex-grow">
                <header className="flex justify-between items-center py-4 px-6 md:px-10 border-b border-slate-800/60 bg-slate-950/50">
                    <div className="text-2xl font-black tracking-tighter text-slate-50 drop-shadow-sm select-none cursor-default">
                        Schuj<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Vider</span>
                    </div>

                    <div className="flex gap-4 items-center">
                        <button
                            onClick={onGoToLogin}
                            className="text-sm font-medium text-slate-300 hover:text-slate-50 transition-colors"
                        >
                            Log in
                        </button>
                        <button
                            onClick={onGoToRegister}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-200 h-9 px-4 py-2"
                        >
                            Register
                        </button>
                    </div>
                </header>

                <main className="flex-grow flex flex-col items-center justify-center text-center px-6 pb-20 pt-16">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-50 max-w-4xl tracking-tight mb-6 drop-shadow-sm">
                        Organizá tus proyectos y <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">dividí el trabajo</span>
                    </div>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
                        La plataforma pensada para dividir el trabajo. Creá tus listas de tareas, desglosá los problemas grandes en partes más pequeñas y asignáselas a tus compañeros fácilmente.
                    </p>

                    <div className="flex gap-4 flex-col sm:flex-row">
                        <button
                            onClick={onGoToRegister}
                            className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-200 h-11 px-8 py-2 shadow-lg"
                        >
                            Crear mi primer tablero
                        </button>
                        <button
                            onClick={onGoToLogin}
                            className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 border border-slate-700 bg-slate-900/50 text-slate-50 hover:bg-slate-800 h-11 px-8 py-2"
                        >
                            Ya tengo una cuenta
                        </button>
                    </div>

                    <div className="mt-16 w-full max-w-3xl bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-left">
                        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-3">
                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                        </div>
                        <div className="p-6">
                            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 shadow-sm">
                                <div className="font-semibold text-sm text-slate-200 mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    Tarea Principal: Armar el Backend
                                </div>
                                <div className="ml-2 pl-4 border-l border-slate-800 flex flex-col gap-2">
                                    <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-md text-sm text-slate-400 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded border border-slate-700"></div>
                                        Subtarea 1: Configurar base de datos
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-md text-sm text-slate-400 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded border border-slate-700"></div>
                                        Subtarea 2: Crear endpoints JWT
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Inicio;