// Punto de entrada de Karma/webpack.
// 1) setup global (matchers personalizados + limpieza entre pruebas)
import './setup.js'

// 2) todas las pruebas *.spec.js / *.spec.jsx de esta carpeta
const specs = import.meta.webpackContext('./', { recursive: true, regExp: /\.spec\.jsx?$/ })
specs.keys().forEach(specs)

// 3) importa todos los módulos de src/ (menos main.jsx, que monta la app en #root)
//    para que el informe de cobertura incluya también los archivos sin pruebas.
const sources = import.meta.webpackContext('../src', { recursive: true, regExp: /^\.\/(?!main\.jsx$).*\.jsx?$/ })
sources.keys().forEach(sources)
