import React from 'react';

export default function TestCodeOSS() {
    return (
        <div className="h-full bg-gray-900 text-white p-4">
            <div className="bg-red-500 text-white p-4 rounded mb-4">
                <h1 className="text-2xl font-bold">🚨 TEST CODE-OSS FUNCIONANDO 🚨</h1>
                <p>Si ves este mensaje, el componente se está cargando correctamente</p>
            </div>
            
            <div className="bg-blue-600 p-4 rounded mb-4">
                <h2 className="text-xl font-bold">Simulando VSCode</h2>
                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="bg-gray-800 p-3 rounded">
                        <h3 className="font-bold">Explorer</h3>
                        <div className="text-sm mt-2">
                            📁 src/<br/>
                            📄 main.js<br/>
                            📄 index.html
                        </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded col-span-2">
                        <h3 className="font-bold">Editor</h3>
                        <div className="bg-black p-2 mt-2 font-mono text-sm">
                            <div className="text-green-400">// Código aquí</div>
                            <div className="text-blue-400">function main() {'{'}</div>
                            <div className="text-yellow-400">  console.log("Hello");</div>
                            <div className="text-blue-400">{'}'}</div>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                        <h3 className="font-bold">Terminal</h3>
                        <div className="bg-black p-2 mt-2 font-mono text-sm">
                            <div className="text-green-400">$ npm start</div>
                            <div className="text-white">Hello World!</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-green-600 p-4 rounded">
                <h2 className="text-xl font-bold">✅ Componente cargado exitosamente</h2>
                <p>Una vez que veas esto, sabremos que el sistema funciona</p>
            </div>
        </div>
    );
}