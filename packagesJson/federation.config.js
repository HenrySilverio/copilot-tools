const { withNativeFederation } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'recr-fed-agc-posvenda',

  // Ilha isolada: o remote bundla o próprio Angular/rxjs.
  // Nada é negociado com o shell (que também não compartilha nada).
  shared: {},

  exposes: {
    './component': './src/app/app.component.ts',
    './bootstrap-webcomponent': './src/bootstrap-webcomponent.ts',
  },

  // Internos deste remote NÃO são libs federadas (barra o shared-mappings
  // dos aliases de tsconfig e resolve os WARN de "entryPoint/barrel").
  skip: [(name) => name.startsWith('@app/') || name.startsWith('@core/') || name.startsWith('@shared/')],
});