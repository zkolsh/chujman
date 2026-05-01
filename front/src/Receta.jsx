import React from 'react';

function Receta({ onLogout }) {
  return (
    <div className="bg-amber-50 min-h-screen text-gray-800 font-sans pb-12">
      
      <nav className="bg-white shadow-sm p-4 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="text-xl font-bold text-amber-700">Recetas Patrias</span>
          <button 
            onClick={onLogout}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-lg">
        
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Pastelitos Caseros</h1>
          <p className="text-lg text-gray-600 italic">La clásica receta patria, con todos los trucos paso a paso y la firma de Paulina.</p>
        </header>

        <div className="mb-10 rounded-lg overflow-hidden h-64 md:h-80 bg-gray-200 shadow-inner">
          <img src="/pastelitos-membrillo.webp" alt="Pastelitos caseros rellenos de membrillo" className="w-full h-full object-cover" />
        </div>
        
        <div className="bg-amber-100 p-4 rounded-lg -mt-8 mb-12 mx-auto max-w-2xl text-center border border-amber-200">
          <p className="text-sm text-amber-900 font-medium">👉 En esta foto, puedes ver un pastelito cortado mostrando su delicioso relleno de <span className="font-bold">dulce de membrillo</span>.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <section className="md:col-span-1 bg-amber-100 p-6 rounded-xl h-fit shadow-sm border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-2 border-b border-amber-300 pb-2">Ingredientes</h2>
            <p className="text-sm text-amber-700 mb-6 font-medium italic">Rinde: 2 docenas</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-amber-800 mb-2">Para la masa:</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• 500 g de harina 0000</li>
                  <li>• 100 g de manteca</li>
                  <li>• 250 cc de agua</li>
                  <li>• 1 pizca de sal</li>
                  <li>• ½ cucharadita de jugo de limón</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-amber-800 mb-2">Para hojaldrar:</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Manteca o margarina derretida</li>
                  <li>• Almidón de maíz (maicena)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-amber-800 mb-2">Para el relleno:</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• 125 g de dulce de membrillo</li>
                  <li>• 125 g de dulce de batata</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Paso a paso</h2>
            
            <ol className="space-y-8 text-gray-700">
              <li className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <h4 className="font-bold text-lg text-amber-700 mb-2">1. Preparar la masa</h4>
                <p>Arenar la harina con la manteca. Agregar agua de a poco y jugo de limón. Integrar sin amasar. Llevar a heladera 30 min.</p>
              </li>
              <li className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <h4 className="font-bold text-lg text-amber-700 mb-2">2. Hojaldrar</h4>
                <p>Estirar, pintar con manteca y espolvorear con maicena. Doblar en tres, volver a estirar y enrollar. Estirar nuevamente.</p>
              </li>
              <li className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <h4 className="font-bold text-lg text-amber-700 mb-2">3. Cortar y rellenar</h4>
                <p>Cortar cuadrados de 5cm. Colocar dulce, pintar bordes con agua, cubrir con otro cuadrado en diagonal y pellizcar puntas.</p>
              </li>
              <li className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <h4 className="font-bold text-lg text-amber-700 mb-2">4. Freír</h4>
                <p>Freír a fuego medio (140°C) 2 minutos. Luego subir el fuego (200°C) para dorar. Escurrir en papel absorbente.</p>
              </li>
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Receta;