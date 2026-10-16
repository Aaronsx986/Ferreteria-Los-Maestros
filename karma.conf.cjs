// Configuración de Karma + Jasmine para el frontend React (Ferretería Los Maestros)
//
//   npm test             -> ejecuta todas las pruebas una vez (ChromeHeadless)
//   npm run test:watch   -> modo observador mientras se desarrolla
//   npm run test:coverage-> pruebas + informe de cobertura en /coverage
//
// Flujo: webpack empaqueta test/index.js (JSX con Babel) -> Karma lo abre en Chrome
// -> Jasmine ejecuta los describe/it -> karma-coverage mide qué código se ejecutó.
const path = require('path')

module.exports = function (config) {
  const withCoverage = process.env.COVERAGE === '1'

  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    plugins: [
      require('karma-jasmine'),
      require('karma-webpack'),
      require('karma-chrome-launcher'),
      require('karma-sourcemap-loader'),
      require('karma-spec-reporter'),
      require('karma-coverage'),
    ],

    // Un único punto de entrada: carga el setup, todas las pruebas y (para medir
    // cobertura real) todos los módulos de src/.
    files: [{ pattern: 'test/index.js', watched: false }],
    preprocessors: { 'test/index.js': ['webpack', 'sourcemap'] },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx', '.json'] },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: { chrome: '110' } }],
                  ['@babel/preset-react', { runtime: 'automatic' }],
                ],
                // Instrumenta SOLO el código de src/ (no las pruebas ni node_modules)
                plugins: withCoverage
                  ? [['istanbul', { include: ['src/**/*.js', 'src/**/*.jsx'], exclude: ['src/main.jsx'] }]]
                  : [],
              },
            },
          },
        ],
      },
      performance: { hints: false },
      stats: 'errors-only',
    },
    webpackMiddleware: { stats: 'errors-only' },

    reporters: withCoverage ? ['spec', 'coverage'] : ['spec'],
    specReporter: {
      suppressPassed: false,
      suppressSkipped: true,
      showSpecTiming: false,
    },
    coverageReporter: {
      dir: path.join(__dirname, 'coverage'),
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'text' },
        { type: 'lcov', subdir: 'lcov' },
        { type: 'json-summary', subdir: '.', file: 'coverage-summary.json' },
      ],
    },

    client: {
      jasmine: { random: true, failSpecWithNoExpectations: true },
      clearContext: false,
    },

    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      // --no-sandbox permite correr en contenedores/CI; en tu PC también funciona
      ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-gpu'] },
    },
    singleRun: true,
    autoWatch: false,
    browserNoActivityTimeout: 120000,
    captureTimeout: 120000,
    logLevel: config.LOG_INFO,
  })
}
